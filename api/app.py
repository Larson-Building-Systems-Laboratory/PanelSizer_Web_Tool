import os
import sys
import io
import contextlib
import logging

from flask import Flask, request, jsonify

BACKEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend")
sys.path.insert(0, BACKEND_DIR)

from Dwelling_v2 import Dwelling, Appliance  # noqa: E402

app = Flask(__name__)
# Uploads/requests are tiny JSON bodies; refuse anything over 1 MB.
app.config["MAX_CONTENT_LENGTH"] = 1 * 1024 * 1024
log = logging.getLogger("panelsizer")

# No CORS: the browser only talks to the Next.js site, which proxies /api/* to this
# server, so other websites have no reason to call it directly.


@app.after_request
def security_headers(response):
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    return response


@app.errorhandler(Exception)
def unhandled_error(e):
    code = getattr(e, "code", 500)
    if not isinstance(code, int) or code >= 500:
        log.exception("Unhandled error on %s %s", request.method, request.path)
        return jsonify({"success": False, "error": "Something went wrong on the server. Please try again."}), 500
    return jsonify({"success": False, "error": getattr(e, "description", "Bad request.")}), code


def validate(data):
    errors = []

    sq_ft = data.get("square_feet")
    if sq_ft is None or not isinstance(sq_ft, (int, float)) or sq_ft <= 0:
        errors.append("square_feet must be a positive number.")

    kitchen = data.get("kitchen_circuits", 2)
    if not isinstance(kitchen, int) or kitchen < 1:
        errors.append("kitchen_circuits must be a positive integer.")

    laundry = data.get("laundry_circuits", 1)
    if not isinstance(laundry, int) or laundry < 1:
        errors.append("laundry_circuits must be a positive integer.")

    material = data.get("material", "copper")
    if not isinstance(material, str) or material.lower() not in ("copper", "aluminum"):
        errors.append("material must be 'copper' or 'aluminum'.")

    method = data.get("method", "Standard")
    if method not in ("Standard", "Optional"):
        errors.append("method must be 'Standard' or 'Optional'.")

    phase = data.get("phase", 1)
    if phase not in (1, 3):
        errors.append("phase must be 1 (single-phase) or 3 (three-phase).")
    allowed_voltages = (120, 240) if phase == 1 else (120, 208)

    apps = data.get("appliances", [])
    if not isinstance(apps, list):
        errors.append("appliances must be a list.")
    else:
        for i, a in enumerate(apps):
            if not isinstance(a, dict) or not isinstance(a.get("name", ""), str):
                errors.append(f"Appliance {i + 1}: must have a text name.")
                continue
            if not a.get("name", "").strip():
                errors.append(f"Appliance {i + 1}: name is required.")
            power = a.get("power_watts")
            if power is None or not isinstance(power, (int, float)) or power <= 0:
                errors.append(f"Appliance {i + 1}: power_watts must be a positive number.")
            if a.get("voltage", allowed_voltages[-1]) not in allowed_voltages:
                errors.append(
                    f"Appliance {i + 1}: voltage must be one of {allowed_voltages} for "
                    f"{'single' if phase == 1 else 'three'}-phase service."
                )

    return errors


@app.route("/api/calculate", methods=["POST"])
def calculate():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"success": False, "error": "Invalid JSON body."}), 400

    errors = validate(data)
    if errors:
        return jsonify({"success": False, "error": " ".join(errors)}), 400

    sq_ft = data["square_feet"]
    kitchen = data.get("kitchen_circuits", 2)
    laundry = data.get("laundry_circuits", 1)
    material = data.get("material", "copper").lower()
    method = data.get("method", "Standard")
    phase = data.get("phase", 1)
    service_voltage = 240 if phase == 1 else 208

    apps = [
        Appliance(a["name"].strip(), a["power_watts"], a.get("voltage", service_voltage))
        for a in data.get("appliances", [])
    ]

    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            dwelling = Dwelling(
                square_feet=sq_ft,
                appliances=apps,
                kitchen_circuits=kitchen,
                laundry_circuits=laundry,
                voltage=service_voltage,
                nphase=phase,
            )
            service, neutral = dwelling.get_service_entrance_size(material=material, method=method)
            grounding = dwelling.get_grounding_conductor_size(
                service["conductor_size"], material=material
            )
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception:
        log.exception("Panel sizing calculation failed")
        return jsonify({"success": False, "error": "The calculation could not be completed. Please check your inputs and try again."}), 500

    log = [line for line in buf.getvalue().splitlines() if line.strip()]

    return jsonify({
        "success": True,
        "log": log,
        "method": method,
        "material": material,
        "phase": phase,
        "service": service,
        "neutral": neutral,
        "grounding_conductor_size": grounding,
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=False)
