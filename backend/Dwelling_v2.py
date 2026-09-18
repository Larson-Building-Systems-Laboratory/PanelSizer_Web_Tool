"""
Dwelling_v2.py
--------------
NEC-based electrical load calculations for residential dwellings.

Use case
--------
Self-contained, importable module for programmatic service entrance sizing.
All lookup tables are class-level constants (no CSV dependency for conductor
or grounding data).  Supports both the Standard and Optional NEC sizing
methods.  HVAC-type appliances are recognized by keywords in their names
("Heat Pump", "Air Conditioner", "Electric Heating System", or generic
"HVAC"), making this suitable for data-driven workflows where appliance
lists are generated programmatically (e.g., from a building energy model).

Demand factor tables for dryers and ranges are still loaded from CSV files
so they can be updated without code changes.

Classes
-------
Appliance   – Represents a single electrical appliance.
Dwelling    – Computes service load, neutral load, conductor sizing, and grounding.

NEC References  (Krarti, Energy-Efficient Electrical Systems for Buildings, Ch. 7)
-----------------------------------------------------------------------------------
220.12   General lighting load (3 VA/ft²)
220.52   Small-appliance and laundry circuits (1 500 VA each)
220.42   General load demand factors (standard method)
220.53   Fixed appliance demand factor (75 % for >= 4 appliances)
220.54   Dryer demand factors (Table 7.1)
220.55   Range demand factors (Table 7.2, Columns A / B / C)
220.60   HVAC: 100 % of largest unit (standard method)
220.61   Neutral reduction: dryers and ranges at 70 %
220.82   Optional method demand factors (Table 7.3 for HVAC)
250.66   Grounding electrode conductor sizing (Table 7.6)
"""

import os
import numpy as np
import pandas as pd


# ---------------------------------------------------------------------------
# Appliance
# ---------------------------------------------------------------------------

class Appliance:
    """A single electrical appliance with a fixed power draw."""

    def __init__(self, name: str, power: float, voltage: int = 240):
        self.name    = name
        self.power   = power    # Watts / VA
        self.voltage = voltage

    def demand_load(self) -> float:
        return self.power


# ---------------------------------------------------------------------------
# Dwelling
# ---------------------------------------------------------------------------

class Dwelling:
    """
    NEC load calculation for a single dwelling unit.
    Supports the standard method (phases + neutral) and the optional method
    (phases only; neutral is always sized by the standard method).

    Parameters
    ----------
    square_feet      : Conditioned floor area (ft²).
    appliances       : List of Appliance objects (default: empty).
    kitchen_circuits : Number of small-appliance branch circuits (NEC min = 2).
    laundry_circuits : Number of laundry branch circuits (NEC min = 1).
    voltage          : Service voltage - 240 V for single-phase, 208 V for 3-phase wye.
    nphase           : Number of phases (1 or 3).

    Appliance naming conventions expected by this class
    ---------------------------------------------------
    Special (handled individually), matched case-insensitively anywhere in
    the appliance name (e.g. "Dryer", "Clothes Dryer", "Range", "Electric
    Range" all match):
        "Dryer"                  -> dryer demand factors (Table 7.1)
        "Range"                  -> range demand factors (Table 7.2)
        "Heat Pump", "Air Conditioner", "Electric Heating System",
        or any name containing "HVAC"
                                 -> HVAC standard/optional demand factors
    Motor-type (included in fixed load + 25 % demand adder):
        "Compactor", "Disposal", "Motor"
    All others                   -> fixed appliance load (NEC 220.53)
    """

    # Appliance classification keyword sets (matched case-insensitively)
    # "Air Condition" matches both "Air Conditioner" and "Air Conditioning"
    _HVAC_KEYWORDS   = ("hvac", "heat pump", "air condition", "electric heating", "cooling")
    _MOTOR_KEYWORDS  = ("compactor", "disposal", "motor")
    _DRYER_KEYWORDS  = ("dryer",)
    _RANGE_KEYWORDS  = ("range",)

    # -----------------------------------------------------------------------
    # Table 7.5 – Single-Phase Service Entrance Ratings and Conductor Sizes
    # (Krarti Table 7.5 / NEC Table 310.15(B)(6))
    # -----------------------------------------------------------------------
    SERVICE_SIZING_GUIDE = {
        100: {"copper": "2 AWG",                        "aluminum": "1/0 AWG"},
        125: {"copper": "1 AWG",                        "aluminum": "2/0 AWG"},
        150: {"copper": "1/0 AWG",                      "aluminum": "3/0 AWG"},
        175: {"copper": "2/0 AWG",                      "aluminum": "4/0 AWG"},
        200: {"copper": "3/0 AWG",                      "aluminum": "250 MCM"},
        225: {"copper": "4/0 AWG",                      "aluminum": "300 MCM"},
        250: {"copper": "250 MCM",                      "aluminum": "350 MCM"},
        300: {"copper": "350 MCM",                      "aluminum": "500 MCM"},
        350: {"copper": "500 MCM",                      "aluminum": "700 MCM or 2 parallel 4/0"},
        400: {"copper": "600 MCM or 2 parallel 3/0",   "aluminum": "900 MCM or 2 parallel 250"},
    }

    # -----------------------------------------------------------------------
    # Table 7.6 – Service Grounding Conductor Sizes
    # (Krarti Table 7.6 / NEC Table 250.66)
    # Maps service-entrance conductor size -> grounding electrode conductor size
    # -----------------------------------------------------------------------
    GROUNDING_LOOKUP = {
        "copper": {
            "3 AWG":    "8 AWG",   "2 AWG":    "8 AWG",
            "1 AWG":    "6 AWG",   "1/0 AWG":  "6 AWG",
            "2/0 AWG":  "4 AWG",   "3/0 AWG":  "4 AWG",
            "4/0 AWG":  "2 AWG",   "250 MCM":  "2 AWG",
            "300 MCM":  "2 AWG",   "350 MCM":  "2 AWG",
            "400 MCM":  "1/0 AWG", "500 MCM":  "1/0 AWG",
            "600 MCM":  "1/0 AWG",
            "700 MCM":  "2/0 AWG", "800 MCM":  "2/0 AWG",
            "900 MCM":  "2/0 AWG", "1000 MCM": "2/0 AWG",
            "1100 MCM": "2/0 AWG",
        },
        "aluminum": {
            "1 AWG":    "6 AWG",   "1/0 AWG":  "6 AWG",
            "2/0 AWG":  "4 AWG",   "3/0 AWG":  "4 AWG",
            "4/0 AWG":  "2 AWG",   "250 MCM":  "2 AWG",
            "300 MCM":  "1/0 AWG", "350 MCM":  "1/0 AWG",
            "400 MCM":  "1/0 AWG", "500 MCM":  "1/0 AWG",
            "600 MCM":  "3/0 AWG", "700 MCM":  "3/0 AWG",
            "800 MCM":  "3/0 AWG",
            "1000 MCM": "4/0 AWG", "1100 MCM": "4/0 AWG",
            "1250 MCM": "4/0 AWG", "1500 MCM": "4/0 AWG",
            "1750 MCM": "4/0 AWG",
        },
    }

    # -----------------------------------------------------------------------
    # NEC Table 310.16 – Ampacities of insulated conductors (75 °C column)
    # -----------------------------------------------------------------------
    # Used to size the neutral conductor from its OWN calculated demand load
    # rather than the service rating: NEC 310.15(B)(7) / 220.61 allow the
    # neutral to be smaller than the ungrounded (phase) conductors, down to
    # (but never below) the grounding conductor size required for the
    # service, per NEC 250.24(C)(1). The Table 7.5 / 310.15(B)(6) service
    # sizing guide above is NOT used here because it only starts at 100 A,
    # which would over-size a lightly loaded neutral.
    # -----------------------------------------------------------------------
    NEUTRAL_SIZING_ORDER = [
        "14 AWG", "12 AWG", "10 AWG", "8 AWG", "6 AWG", "4 AWG", "3 AWG",
        "2 AWG", "1 AWG", "1/0 AWG", "2/0 AWG", "3/0 AWG", "4/0 AWG",
        "250 MCM", "300 MCM", "350 MCM", "400 MCM", "500 MCM", "600 MCM",
        "700 MCM", "750 MCM", "800 MCM", "900 MCM", "1000 MCM",
    ]

    AMPACITY_75C = {
        "copper": {
            "14 AWG": 20,  "12 AWG": 25,  "10 AWG": 35,  "8 AWG": 50,
            "6 AWG": 65,   "4 AWG": 85,   "3 AWG": 100,  "2 AWG": 115,
            "1 AWG": 130,  "1/0 AWG": 150, "2/0 AWG": 175, "3/0 AWG": 200,
            "4/0 AWG": 230, "250 MCM": 255, "300 MCM": 285, "350 MCM": 310,
            "400 MCM": 335, "500 MCM": 380, "600 MCM": 420, "700 MCM": 460,
            "750 MCM": 475, "800 MCM": 490, "900 MCM": 520, "1000 MCM": 545,
        },
        "aluminum": {
            "12 AWG": 20,  "10 AWG": 25,  "8 AWG": 40,   "6 AWG": 50,
            "4 AWG": 65,   "3 AWG": 75,   "2 AWG": 90,   "1 AWG": 100,
            "1/0 AWG": 120, "2/0 AWG": 135, "3/0 AWG": 155, "4/0 AWG": 180,
            "250 MCM": 205, "300 MCM": 230, "350 MCM": 250, "400 MCM": 270,
            "500 MCM": 310, "600 MCM": 340, "700 MCM": 375, "750 MCM": 385,
            "800 MCM": 395, "900 MCM": 425, "1000 MCM": 445,
        },
    }

    def __init__(
        self,
        square_feet:      float,
        appliances:       list = None,
        kitchen_circuits: int  = 2,
        laundry_circuits: int  = 1,
        voltage:          int  = 240,
        nphase:           int  = 1,
    ):
        self.square_feet      = square_feet
        self.appliances       = appliances or []
        self.kitchen_circuits = kitchen_circuits
        self.laundry_circuits = laundry_circuits
        self.voltage          = voltage
        self.nphase           = nphase
        self._dir             = os.path.dirname(os.path.abspath(__file__))

    # -----------------------------------------------------------------------
    # Private helpers
    # -----------------------------------------------------------------------

    def _is_hvac(self, appliance: "Appliance") -> bool:
        name = appliance.name.lower()
        return any(k in name for k in self._HVAC_KEYWORDS)

    def _is_motor(self, appliance: "Appliance") -> bool:
        name = appliance.name.lower()
        return any(k in name for k in self._MOTOR_KEYWORDS)

    def _is_dryer(self, appliance: "Appliance") -> bool:
        name = appliance.name.lower()
        return any(k in name for k in self._DRYER_KEYWORDS)

    def _is_range(self, appliance: "Appliance") -> bool:
        name = appliance.name.lower()
        return any(k in name for k in self._RANGE_KEYWORDS)

    def _phase_divisor(self) -> float:
        return self.voltage * (3 ** 0.5 if self.nphase == 3 else 1.0)

    # -----------------------------------------------------------------------
    # General Load  (NEC 220.12 / 220.52)
    # -----------------------------------------------------------------------

    def general_lighting_load(self) -> float:
        """3 VA per square foot (NEC 220.12)."""
        return self.square_feet * 3

    def kitchen_load(self) -> float:
        """1 500 VA per small-appliance circuit (NEC 220.52(A))."""
        return self.kitchen_circuits * 1_500

    def laundry_load(self) -> float:
        """1 500 VA per laundry circuit (NEC 220.52(B))."""
        return self.laundry_circuits * 1_500

    def general_load(self) -> float:
        """Sum of lighting, kitchen, and laundry loads."""
        return self.general_lighting_load() + self.kitchen_load() + self.laundry_load()

    # -----------------------------------------------------------------------
    # Demand Factors
    # -----------------------------------------------------------------------

    def apply_general_load_demand_factor(self, total: float) -> float:
        """
        NEC Table 220.42 demand factors for general loads (standard method):
          * First 3 000 VA      -> 100 %
          * 3 001 - 120 000 VA  -> 35 %
          * Above 120 000 VA    -> 25 %
        """
        if total <= 3_000:
            reduced = total
        elif total <= 120_000:
            reduced = 3_000 + (total - 3_000) * 0.35
        else:
            reduced = 3_000 + (120_000 - 3_000) * 0.35 + (total - 120_000) * 0.25

        print(f"General load demand factor: {total:.0f} VA -> {reduced:.0f} VA")
        return reduced

    def opt_apply_general_load_demand_factor(self, total: float) -> float:
        """
        Optional method demand factor (NEC 220.82, Eq. 7.5):
          * First 10 000 VA  -> 100 %
          * Above 10 000 VA  -> 40 %

        'total' is CL_GL,O = CL_GL + CL_AP (all appliances except HVAC), Eq. 7.6.
        """
        if total <= 10_000:
            reduced = total
        else:
            reduced = 10_000 + (total - 10_000) * 0.40

        print(f"Optional general load demand factor: {total:.0f} VA -> {reduced:.0f} VA")
        return reduced

    # -----------------------------------------------------------------------
    # Fixed Appliance Load  (NEC 220.53)
    # -----------------------------------------------------------------------

    def fixed_appliance_load(self, appliances: list) -> float:
        """
        Demand load for fixed appliances (NEC 220.53):
            DL_FA = DF x CL_FA

        Dryers, ranges, and HVAC are excluded (special appliances).
        Motors (Compactor, Disposal, Motor) ARE included in CL_FA per
        textbook Example 7.2. Their 25%-of-largest adder is added separately
        in special_appliance_load().

        FIX: DF is applied based on the count of *eligible* appliances,
        not the length of the raw list passed in.

        Parameters
        ----------
        appliances : Subset to evaluate - pass self.appliances for phase load,
                     or the 120 V subset for the neutral load.
        """
        eligible = [
            a for a in appliances
            if not self._is_dryer(a) and not self._is_range(a) and not self._is_hvac(a)
        ]
        total   = sum(a.power for a in eligible)
        df      = 0.75 if len(eligible) >= 4 else 1.0
        reduced = total * df

        print(
            f"Fixed appliance load ({[a.name for a in eligible]}): "
            f"{total:.0f} VA -> {reduced:.0f} VA (DF={df})"
        )
        return reduced

    # -----------------------------------------------------------------------
    # Special Appliance Loads
    # -----------------------------------------------------------------------

    def special_appliance_load(self) -> float:
        """
        Categorise appliances and compute demand-factored loads for
        dryers, ranges, HVAC, and motors. Stores individual totals as
        instance attributes for later reuse in total_neutral_load_va().
        """
        dryers = [a for a in self.appliances if self._is_dryer(a)]
        ranges = [a for a in self.appliances if self._is_range(a)]
        hvac   = [a for a in self.appliances if self._is_hvac(a)]
        motors = [a for a in self.appliances if self._is_motor(a)]

        self.total_dryer_load = self.calculate_dryer_load(dryers) if dryers else 0.0
        self.total_range_load = self.calculate_range_load(ranges) if ranges else 0.0
        self.total_hvac_load  = self.calculate_hvac_load(hvac)    if hvac   else 0.0
        self.total_motor_load = self.calculate_motor_load(motors)

        special_total = (
            self.total_dryer_load
            + self.total_range_load
            + self.total_hvac_load
            + self.total_motor_load
        )

        print(
            f"Special loads — Dryer: {self.total_dryer_load:.0f} VA, "
            f"Range: {self.total_range_load:.0f} VA, "
            f"HVAC: {self.total_hvac_load:.0f} VA, "
            f"Motor: {self.total_motor_load:.0f} VA  ->  Total: {special_total:.0f} VA"
        )
        return special_total

    def calculate_dryer_load(self, dryers: list) -> float:
        """
        NEC Table 220.54 dryer demand factors (Table 7.1, loaded from CSV).
        Each dryer rated at max(nameplate, 5 000 VA).
        Fewer than 4 dryers -> 100 % demand factor (treated as n=4 in CSV).
        """
        df_table = pd.read_csv(os.path.join(self._dir, "demand_factors_dryers.csv"))
        n        = len(dryers)
        n_lookup = max(n, 4)    # NEC: treat fewer than 4 as 4

        match = df_table.loc[df_table["Number of Dryers"] == n_lookup, "Demand Factor (%)"]
        if match.empty:
            raise ValueError(
                f"No dryer demand factor found for {n_lookup} dryers "
                "in demand_factors_dryers.csv"
            )
        df_pct = float(match.values[0])

        print(f"Dryer demand factor: {df_pct}% for {n} dryer(s)")
        return sum(max(d.power, 5_000) for d in dryers) * df_pct / 100

    def calculate_range_load(self, ranges: list) -> float:
        """
        NEC Table 220.55 range demand factors (Table 7.2, loaded from CSV).

        Column A : <= 3 400 W         -> % of nameplate
        Column B : 3 500 - 8 750 W    -> % of nameplate
        Column C : > 8 750 W          -> fixed maximum demand (kW) from table

        Table 7.2 footnotes:
        Note 1 - Single range > 12 kW up to 27 kW:
            multiplier = 1 + (rating_kW - 12) * 0.05
        Note 2 - Multiple ranges of different ratings (none > 27 kW):
            average rating treating sub-12 kW ranges as 12 kW;
            apply 5 %/kW adder when the average exceeds 12 kW.

        FIX: The average substitutes 12 kW for sub-12 kW ranges (per Note 2)
        without artificially clipping power before Column C, which previously
        caused double-counting of the adder in the original version.
        """
        df_table = pd.read_csv(os.path.join(self._dir, "demand_factors_ranges.csv"))
        n = len(ranges)

        row = df_table.loc[df_table["Number of Ranges"] == n]
        if row.empty:
            n_adj = (n // 10 + 1) * 10
            if n_adj >= 50:
                row = df_table.iloc[[-1]].copy()
                row["Column C: Maximum Demand (kW) (8.75 - 12 kW)"] = 25_000 + 1_000 * n
            else:
                row = df_table.loc[df_table["Number of Ranges"] == n_adj].copy()
                row["Column C: Maximum Demand (kW) (8.75 - 12 kW)"] = 15_000 + 1_000 * n

        col_a_pct  = float(row["Column A: Demand Factors (%) (Less than 3.4 kW)"].values[0])
        col_b_pct  = float(row["Column B: Demand Factors (%) (3.5-8.75 kW)"].values[0])
        col_c_base = float(row["Column C: Maximum Demand (kW) (8.75 - 12 kW)"].values[0]) * 1_000

        total_demand    = 0.0
        high_pwr_ranges = []

        for r in ranges:
            if r.power <= 3_400:
                total_demand += r.power * col_a_pct / 100
            elif r.power <= 8_750:
                total_demand += r.power * col_b_pct / 100
            else:                         # Column C: power > 8 750 W
                high_pwr_ranges.append(r)

        if high_pwr_ranges:
            # Note 2: treat any range < 12 kW as 12 kW for the average
            powers     = np.array([max(r.power, 12_000) for r in high_pwr_ranges], dtype=float)
            avg_w      = float(np.mean(powers))
            multiplier = 1.0 + max(0.0, (avg_w - 12_000) / 1_000) * 0.05
            total_demand += col_c_base * multiplier

        print(f"Range demand factor applied. Total range load: {total_demand:.0f} VA")
        return total_demand

    def calculate_hvac_load(self, hvac: list) -> float:
        """
        Standard method HVAC load (NEC 220.60):
        100 % of the largest heating or cooling unit only.
        Non-coincident heating/cooling operation is assumed.
        """
        return float(max(h.power for h in hvac))

    def opt_calculate_hvac_load(self, hvac: list = None) -> float:
        """
        Optional method HVAC demand load (NEC 220.82(C) / Table 7.3).

        Demand factors by system type:
        ----------------------------------------------------------------
        "Air Conditioner" / "Cooling"               -> 100 %
        "Heat Pump"                                 -> 100 %
        "Electric Heating System" (< 4 units)       -> 65 %
        "Electric Heating System" (>= 4 units)      -> 40 %
        Generic "HVAC" (type unspecified)           -> 100 %
        ----------------------------------------------------------------
        Sub-type is detected by checking for keywords in the appliance
        name (e.g. "Electric Heating System 1").

        The method returns the *largest* of all computed demand loads,
        consistent with NEC taking the worst-case non-coincident load.
        """
        units = hvac if hvac is not None else [a for a in self.appliances if self._is_hvac(a)]
        if not units:
            return 0.0

        electric_heating = [u for u in units if "Electric Heating" in u.name]
        cooling          = [u for u in units if
                            "Cooling" in u.name
                            or "Air Condition" in u.name
                            or "Heat Pump" in u.name]
        generic          = [u for u in units
                            if u not in electric_heating and u not in cooling]

        demand_loads = []

        # Cooling and heat pumps: 100 %
        for u in cooling + generic:
            demand_loads.append(u.power * 1.00)

        # Electric heating: 65 % for < 4 units, 40 % for >= 4 units
        if electric_heating:
            factor = 0.40 if len(electric_heating) >= 4 else 0.65
            demand_loads.append(max(h.power for h in electric_heating) * factor)

        return float(max(demand_loads)) if demand_loads else 0.0

    def calculate_motor_load(self, motors: list) -> float:
        """
        Motor demand adder per textbook Section 7.3.1.1 Step 3d:
            DL_motor = 25 % x largest motor nameplate VA

        This is a demand *adder* within DL_SA. The full motor nameplate VA
        is already captured inside fixed_appliance_load (DL_FA), so only the
        25 % surcharge appears here, consistent with textbook Example 7.2:
            "Largest motor (25 % x compactor VA) = 200 VA"
        """
        if not motors:
            return 0.0
        return float(max(m.power for m in motors)) * 0.25

    # -----------------------------------------------------------------------
    # Service & Neutral Totals
    # -----------------------------------------------------------------------

    def total_service_load_va(self) -> float:
        """Standard method total demand load for phases A and B (Eq. 7.3)."""
        demand_base = self.apply_general_load_demand_factor(self.general_load())
        self.total_service_load = (
            demand_base
            + self.fixed_appliance_load(self.appliances)
            + self.special_appliance_load()
        )
        return self.total_service_load

    def service_amps(self) -> float:
        """Service ampacity from total service load (Eq. 7.4)."""
        return self.total_service_load_va() / self._phase_divisor()

    def total_neutral_load_va(self) -> float:
        """
        Standard method neutral (N) demand load (NEC 220.61):
          - DL_GL         : same demand-factored general load as phases
          - DL_FA,N       : 120 V fixed appliances only (DF on 120 V count)
          - Dryers x 70 % : NEC 220.61
          - Ranges x 70 % : NEC 220.61
          - Motor adder   : same 25 % of largest motor as phase
          - HVAC excluded : balanced 240 V load, no neutral current
        """
        demand_base  = self.apply_general_load_demand_factor(self.general_load())
        single_phase = self.fixed_appliance_load(
            [a for a in self.appliances if a.voltage == 120]
        )

        # Reuse cached values from total_service_load_va() if already run
        if not hasattr(self, "total_dryer_load"):
            dryers = [a for a in self.appliances if self._is_dryer(a)]
            self.total_dryer_load = self.calculate_dryer_load(dryers) if dryers else 0.0

        if not hasattr(self, "total_range_load"):
            ranges = [a for a in self.appliances if self._is_range(a)]
            self.total_range_load = self.calculate_range_load(ranges) if ranges else 0.0

        if not hasattr(self, "total_motor_load"):
            motors = [a for a in self.appliances if self._is_motor(a)]
            self.total_motor_load = self.calculate_motor_load(motors)

        dryer_neutral = self.total_dryer_load * 0.70
        range_neutral = self.total_range_load * 0.70

        print(
            f"Neutral special loads — Dryer: {dryer_neutral:.0f} VA, "
            f"Range: {range_neutral:.0f} VA, Motor: {self.total_motor_load:.0f} VA"
        )

        self.total_neutral_load = (
            demand_base
            + single_phase
            + dryer_neutral
            + range_neutral
            + self.total_motor_load
        )
        return self.total_neutral_load

    def neutral_amps(self) -> float:
        """Neutral ampacity from total neutral load."""
        return self.total_neutral_load_va() / self._phase_divisor()

    # -----------------------------------------------------------------------
    # Optional Method  (NEC 220.82 / Section 7.3.2)
    # -----------------------------------------------------------------------

    def _opt_total_service_load_va(self) -> float:
        """
        Optional method total demand load for phases (Eqs. 7.5 - 7.7):
            CL_GL,O = CL_GL + CL_AP   (all appliances except HVAC, Eq. 7.6)
            DL_GL,O = opt demand factor(CL_GL,O)
            DL_HC,O = opt_calculate_hvac_load()
            DL_tot,O = DL_GL,O + DL_HC,O  (Eq. 7.7)
        """
        cl_gl  = self.general_load()
        cl_ap  = sum(a.power for a in self.appliances if not self._is_hvac(a))
        cl_glo = cl_gl + cl_ap

        dl_glo = self.opt_apply_general_load_demand_factor(cl_glo)
        dl_hco = self.opt_calculate_hvac_load()

        self.opt_total_service_load = dl_glo + dl_hco
        print(
            f"Optional method: CL_GL,O={cl_glo:.0f} VA -> DL_GL,O={dl_glo:.0f} VA, "
            f"DL_HC,O={dl_hco:.0f} VA -> Total={self.opt_total_service_load:.0f} VA"
        )
        return self.opt_total_service_load

    # -----------------------------------------------------------------------
    # Conductor Sizing  (Table 7.5 / NEC 310.15(B)(6))
    # -----------------------------------------------------------------------

    def size_service_conductor(self, required_amps: float, material: str = "copper") -> dict:
        """Return the next standard service rating and conductor size for required_amps."""
        material = material.lower()
        if material not in ("copper", "aluminum"):
            raise ValueError("Material must be 'copper' or 'aluminum'.")

        for rating in sorted(self.SERVICE_SIZING_GUIDE):
            if required_amps <= rating:
                return {
                    "service_rating": rating,
                    "conductor_size": self.SERVICE_SIZING_GUIDE[rating][material],
                }

        raise ValueError("Required amps exceed 400 A — parallel design required.")

    def size_neutral_conductor(
        self, required_amps: float, material: str = "copper", min_size: str = None
    ) -> str:
        """
        Size the neutral (grounded) conductor from its own calculated demand
        load using NEC Table 310.16 (75 °C) ampacities, per NEC 220.61 /
        310.15(B)(7): unlike the ungrounded service conductors, the neutral
        is not bound by the 100 A service-sizing-guide floor and may be
        smaller when the demand load justifies it — but never smaller than
        the grounding conductor required for this service (NEC 250.24(C)(1)).

        Parameters
        ----------
        required_amps : Calculated neutral load in amps.
        material      : 'copper' or 'aluminum'.
        min_size      : Smallest permissible conductor size (typically the
                         service's grounding conductor size); the result is
                         bumped up to this size if the ampacity-based pick
                         would otherwise be smaller.
        """
        material = material.lower()
        if material not in ("copper", "aluminum"):
            raise ValueError("Material must be 'copper' or 'aluminum'.")

        table = self.AMPACITY_75C[material]
        size = next(
            (c for c in self.NEUTRAL_SIZING_ORDER if c in table and table[c] >= required_amps),
            None,
        )
        if size is None:
            raise ValueError("Required neutral amps exceed available conductor sizes.")

        if min_size and min_size in self.NEUTRAL_SIZING_ORDER:
            if self.NEUTRAL_SIZING_ORDER.index(size) < self.NEUTRAL_SIZING_ORDER.index(min_size):
                size = min_size

        return size

    def get_service_entrance_size(
        self, material: str = "copper", method: str = "Standard"
    ) -> tuple:
        """
        Calculate service and neutral conductor sizes.

        Parameters
        ----------
        material : 'copper' or 'aluminum'
        method   : 'Standard' (NEC Art. 220) or 'Optional' (NEC 220.82)
                   Note: Optional sizes phase conductors only; neutral is
                   always sized by the Standard method.

        Returns
        -------
        (service_size_dict, neutral_size_dict)
            'service_size_dict' has keys 'service_rating' (A) and
            'conductor_size'. 'neutral_size_dict' has 'service_rating' set
            to None (the neutral is sized by ampacity, not a service rating)
            and 'conductor_size'.
        """
        if method == "Standard":
            print("Standard method — calculating service load ...")
            required_amps = self.service_amps()
            print(f"  Service load: {self.total_service_load:.0f} VA  ->  {required_amps:.1f} A")
            service_size = self.size_service_conductor(required_amps, material)

        elif method == "Optional":
            print("Optional method — calculating service load ...")
            opt_load = self._opt_total_service_load_va()
            self.opt_service_amps = opt_load / self._phase_divisor()
            print(f"  Optional service load: {opt_load:.0f} VA  ->  {self.opt_service_amps:.1f} A")
            service_size = self.size_service_conductor(self.opt_service_amps, material)

        else:
            raise ValueError(f"Unknown method '{method}'. Choose 'Standard' or 'Optional'.")

        print("Calculating neutral load ...")
        required_amps_neutral = self.neutral_amps()
        print(f"  Neutral load: {self.total_neutral_load:.0f} VA  ->  {required_amps_neutral:.1f} A")

        min_neutral_size = None
        try:
            min_neutral_size = self.get_grounding_conductor_size(
                service_size["conductor_size"], material
            )
        except ValueError:
            pass    # Non-standard/parallel service size — skip the grounding-size floor.

        neutral_conductor = self.size_neutral_conductor(
            required_amps_neutral, material, min_size=min_neutral_size
        )
        print(
            f"  Neutral conductor (sized independently, floor = grounding "
            f"conductor {min_neutral_size}): {neutral_conductor}"
        )
        neutral_size = {"service_rating": None, "conductor_size": neutral_conductor}

        return service_size, neutral_size

    def get_service_entrance_size_optional(
        self, hvac_load_va: float, dhw_load_va: float = 0, material: str = "copper"
    ) -> tuple:
        """
        NEC 220.82 Optional Calculation Method for single-family dwellings.

        Use when individual appliance ratings are not available (e.g., direct
        EPD entry from an energy model). Pass HVAC and DHW loads explicitly.

        General loads (lighting + small appliance + laundry + electric DHW):
            100 % of first 10 000 VA + 40 % of remainder  (NEC 220.82(B))
        HVAC: 100 % of the largest load — heating or cooling  (NEC 220.82(C))

        Parameters
        ----------
        hvac_load_va : Largest HVAC load in VA (heating or cooling, whichever is larger).
        dhw_load_va  : Electric DHW heater capacity in VA; 0 for gas DHW.
        material     : 'copper' (default) or 'aluminum'.

        Returns
        -------
        (service_size_dict, neutral_size_dict)
            Each dict has keys 'service_rating' (A) and 'conductor_size'.
        """
        general_lighting = self.square_feet * 3
        small_appliance  = self.kitchen_circuits * 1_500
        laundry          = self.laundry_circuits  * 1_500
        other_loads_va   = general_lighting + small_appliance + laundry + dhw_load_va

        if other_loads_va <= 10_000:
            demand_general = other_loads_va
        else:
            demand_general = 10_000 + (other_loads_va - 10_000) * 0.40

        total_load_va = demand_general + hvac_load_va

        print(
            f"Optional Method (NEC 220.82): general loads = {other_loads_va:.0f} VA "
            f"-> demand = {demand_general:.0f} VA, HVAC = {hvac_load_va:.0f} VA, "
            f"Total = {total_load_va:.0f} VA"
        )

        required_amps_service = total_load_va / self._phase_divisor()
        service_size = self.size_service_conductor(required_amps_service, material)

        # Neutral carries only general demand load; 240 V and HVAC have no neutral current
        required_amps_neutral = demand_general / self._phase_divisor()
        neutral_size = self.size_service_conductor(required_amps_neutral, material)

        print(
            f"  Service: {required_amps_service:.1f} A -> {service_size}, "
            f"Neutral: {required_amps_neutral:.1f} A -> {neutral_size}"
        )
        return service_size, neutral_size

    # -----------------------------------------------------------------------
    # Grounding Conductor  (Table 7.6 / NEC 250.66)
    # -----------------------------------------------------------------------

    def get_grounding_conductor_size(self, entrance_size: str, material: str = "copper") -> str:
        """
        Return the grounding electrode conductor size for a given
        service-entrance conductor size (NEC Table 250.66).
        """
        material = material.lower()
        if material not in ("copper", "aluminum"):
            raise ValueError("Material must be 'copper' or 'aluminum'.")

        table = self.GROUNDING_LOOKUP[material]
        key   = entrance_size.strip().upper()

        if key not in table:
            raise ValueError(
                f"No grounding size found for '{entrance_size}' ({material}). "
                f"Valid entries: {sorted(table.keys())}"
            )
        return table[key]