import io
import contextlib

from flask import Flask, request, jsonify
from flask_cors import CORS
from Dwelling import Dwelling, Appliance

app = Flask(__name__)
CORS(app)


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
    if material.lower() not in ("copper", "aluminum"):
        errors.append("material must be 'copper' or 'aluminum'.")

    apps = data.get("appliances", [])
    if not isinstance(apps, list):
        errors.append("appliances must be a list.")
    else:
        for i, a in enumerate(apps):
            if not a.get("name", "").strip():
                errors.append(f"Appliance {i + 1}: name is required.")
            power = a.get("power_watts")
            if power is None or not isinstance(power, (int, float)) or power <= 0:
                errors.append(f"Appliance {i + 1}: power_watts must be a positive number.")
            if a.get("voltage", 240) not in (120, 240):
                errors.append(f"Appliance {i + 1}: voltage must be 120 or 240.")

    return errors


@app.route("/api/calculate", methods=["POST"])
def calculate():
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"success": False, "error": "Invalid JSON body."}), 400

    errors = validate(data)
    if errors:
        return jsonify({"success": False, "error": " ".join(errors)}), 400

    sq_ft = data["square_feet"]
    kitchen = data.get("kitchen_circuits", 2)
    laundry = data.get("laundry_circuits", 1)
    material = data.get("material", "copper").lower()

    apps = [
        Appliance(a["name"].strip(), a["power_watts"], a.get("voltage", 240))
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
            )
            service, neutral = dwelling.get_service_entrance_size(material=material)
            grounding = dwelling.get_grounding_conductor_size(
                service["conductor_size"], material=material
            )
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": f"Calculation error: {str(e)}"}), 500

    log = [line for line in buf.getvalue().splitlines() if line.strip()]

    return jsonify({
        "success": True,
        "log": log,
        "service": service,
        "neutral": neutral,
        "grounding_conductor_size": grounding,
    })


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=False)
