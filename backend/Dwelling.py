import pandas as pd
import numpy as np
import os

class Appliance:
    def __init__(self, name,power, voltage=240):
        self.name = name
        self.power = power  # Power consumption in watts
        self.voltage = voltage
    def demand_load(self):
        return self.power
    
class Dwelling:
    def __init__(self, square_feet, appliances=None,
                 kitchen_circuits=2, # by default atleast 2 kitchen circuits are assumed
                 laundry_circuits=1, # by default atleast 1 laundry circuit is assumed  
                 voltage=240,
                 nphase=1):
        
        self.square_feet = square_feet
        self.appliances = appliances or []
        self.kitchen_circuits = kitchen_circuits
        self.laundry_circuits = laundry_circuits
        self.voltage = voltage
        self.nphase = nphase    
        self.current_dir = os.path.dirname(os.path.abspath(__file__))
        self.ServiceEntranceSize()
        self.SetGroundingGuide()

    def general_lighting_load(self):
        # NEC general lighting load is 3 VA per square foot
        return self.square_feet * 3 

    def kitchen_load(self):
        # Mandatory kitchen load is 1500 VA per circuit
        return self.kitchen_circuits * 1500

    def laundry_load(self):
        # Mandatory laundry load is 1500 VA per circuit
        return self.laundry_circuits * 1500

    def general_load(self):
        return (
            self.general_lighting_load()
            + self.kitchen_load()
            + self.laundry_load()
        )

    def apply_general_load_demand_factor(self, total):
        # NEC demand factors for dwelling units:
        # - For the first 3,000 VA, the demand factor is 100% (i.e., no reduction).
        # - For the next 117,000 VA (i.e., from 3,001 VA to 120,000 VA), the demand factor is 35%.
        # - For any load above 120,000 VA, the demand factor is 25%.
        if total <= 3000:
            TotalGeneralLoad = total
        elif total <= 120000:
            TotalGeneralLoad = 3000 + (total - 3000) * 0.35
        else:
            TotalGeneralLoad = 3000 + (120000 - 3000) * 0.35 + (total - 120000) * 0.25
        print(f"Applying demand factors to general load: {total} VA reduced to {TotalGeneralLoad} VA.")
        return TotalGeneralLoad

    def fixed_appliance_load(self,appliances):
        # Calculate the total load of appliances and apply demand factor if there are 4 or more appliances
        print("Calculating fixed appliance load for appliances:", [a.name for a in appliances])
        total = sum(a.power for a in appliances if a.name not in ["Clothes Dryer", "Electric Range", "Air Conditioner", "Heat Pump", "Space Heater"])
        if len(appliances) >= 4:
            total_load = total * 0.75
            print(f"Applying demand factor to fixed appliance load: {total} VA reduced to {total_load} VA.")
            return total_load
        return total

    def special_appliance_load(self):
        # Collect each special appliance
        Dryers = []
        Ranges = []
        HVAC = []
        Motor = []
        for app in self.appliances:
            if "Clothes Dryer" in app.name:
                Dryers.append(app)
            elif "Electric Range" in app.name:
                Ranges.append(app)
            elif "Air Conditioner" in app.name or "Heat Pump" in app.name or "Space Heater" in app.name:
                HVAC.append(app)
            elif "Compactor" in app.name or "Disposal" in app.name or "Motor" in app.name:
                Motor.append(app)  
        # Calculate special load for each category applicable and sum them up.
        special_load = 0
        if Dryers:
            self.total_dryer_load = self.calculate_dryer_load(Dryers)
            special_load += self.total_dryer_load
        else:
            self.total_dryer_load = 0
        if Ranges:
            self.total_range_load = self.calculate_range_load(Ranges)
            special_load += self.total_range_load
        else:            
            self.total_range_load = 0
        if HVAC:
            self.total_hvac_load = self.calculate_hvac_load(HVAC)
            special_load += self.total_hvac_load
        else:
            self.total_hvac_load = 0
        if Motor: 
            self.total_motor_load = self.calculate_motor_load(Motor)
            special_load += self.total_motor_load
        else:
            self.total_motor_load = 0
        print(f"Individual special loads - Dryer: {self.total_dryer_load} VA, Range: {self.total_range_load} VA, HVAC: {self.total_hvac_load} VA, Motor: {self.total_motor_load} VA.")
        print(f"Total special appliance load: {special_load} VA.")
        return special_load

    def calculate_dryer_load(self, Dryers):
        # Dryer demand factor is based on number of dryers. All individual dryers have the same deamand factor.
        dryer_demand_factor = pd.read_csv(os.path.join(self.current_dir, "demand_factors_dryers.csv"))
        ndryers = len(Dryers)
        # Choose the corresponding row based on the number of dryers
        if ndryers <= 4:
            ndryers = 4
        DF = dryer_demand_factor.loc[dryer_demand_factor["Number of Dryers"] == ndryers, "Demand Factor (%)"].values[0]
        print(f"Applying a demand factor of {DF}% for {ndryers} dryers.")
        return sum([d.power for d in Dryers]) * DF/100

    def calculate_range_load(self, Ranges):
        range_demand_factor = pd.read_csv(os.path.join(self.current_dir, "demand_factors_ranges.csv"))
        nranges = len(Ranges)
        # Choose the corresponding row based on the number of ranges 
        try:
            # If there is an exact match for the number of ranges, use that row
            df_DF_req = range_demand_factor.loc[range_demand_factor["Number of Ranges"] == nranges]
        except:
            # If not, choose the next highest ten and check if that exists as a row
            nranges_adj = (int(nranges/10)+1)*10
            # If that value if higher than 60 then use the last row
            # For the last column add 1kW for every range along with a base of 15kW
            if nranges_adj > 60:
                df_DF_req = range_demand_factor.iloc[-1, :]
                df_DF_req.iloc[:,-1]= 15000 + 1000*nranges
            else:
                df_DF_req = range_demand_factor.loc[range_demand_factor["Number of Ranges"] == nranges_adj]
                df_DF_req.iloc[:,-1]= 15000 + 1000*nranges

        HighPowerRanges = []
        TotalRangeDemand = 0
        for r in Ranges:
            # Apply demand factors based on columns A and B
            if r.power <=3400:
                TotalRangeDemand += r.power * df_DF_req["Column A: Demand Factors (%) (Less than 3.4 kW)"].values[0]/100
            if r.power > 3400 and r.power <= 8750:
                TotalRangeDemand += r.power * (df_DF_req["Column B: Demand Factors (%) (3.5 kW to 8.75 kW)"].values[0]/100)
            if r.power > 8750 and r.power <= 12000:
                HighPowerRanges.append(r)
        # For the high power ranges take an average of their power and apply demand factor based on column C. 
        # If the average power is above 12 kW, apply an additional 5% increase in demand for every kW above 12 kW.
        if HighPowerRanges:
            # All high power ranges are assumed to have a minimum of 12kW power
            HighPowerRangesPower = np.clip(np.array([r.power for r in HighPowerRanges]), 12000, None)
            avg_HighPower = np.mean(HighPowerRangesPower)
            D_avg_HighPower = df_DF_req["Column C: Maximum Demand (kW) (8.75 - 12 kW)"].astype(float).values[0]*1000
            if avg_HighPower > 12000:
                D_avg_HighPower = D_avg_HighPower*(1+0.05*(avg_HighPower-12000)/1000)
            TotalRangeDemand += D_avg_HighPower
        print(f"Applying demand factors to electric ranges. Total range load: {TotalRangeDemand} VA.")
        return TotalRangeDemand

    def calculate_hvac_load(self, HVAC):
        # Apply 100% to the largest HVAC load
        return max([h.power for h in HVAC])

    def calculate_motor_load(self, Motor):
        # Apply 25% to the largest motor load 
        return max(m.power for m in Motor)*0.25

    def total_service_load_va(self):
        demand_base = self.apply_general_load_demand_factor(self.general_load())
        self.total_service_load = demand_base + self.fixed_appliance_load(self.appliances) + self.special_appliance_load()
        return self.total_service_load
    
    def service_amps(self):
        if self.nphase == 1:
            return self.total_service_load_va() / self.voltage
        elif self.nphase == 3:
            return self.total_service_load_va() / (self.voltage * (self.nphase)**0.5)
    
    def total_neutral_load_va(self):
        demand_base = self.apply_general_load_demand_factor(self.general_load())
        single_phase_appliance_load = self.fixed_appliance_load([a for a in self.appliances if a.voltage == 120])
        print(f"Special appliance loads - Dryer: {self.total_dryer_load*0.7} VA, Range: {self.total_range_load*0.7} VA, Motor: {self.total_motor_load} VA.")
        self.total_neutral_load = demand_base + single_phase_appliance_load + self.total_dryer_load*0.7 + self.total_range_load*0.7 + self.total_motor_load
        return self.total_neutral_load
    def neutral_amps(self):
        if self.nphase == 1:
            return self.total_neutral_load_va() / self.voltage
        elif self.nphase == 3:
            return self.total_neutral_load_va() / (self.voltage * (self.nphase)**0.5)
    
    def ServiceEntranceSize(self):
        # Adapted from Krarti Energy-Efficient Electrical Systems for Buildings
        self.SERVICE_SIZING_GUIDE = {
            100: {"copper": "2 AWG", "aluminum": "1/0 AWG"},
            125: {"copper": "1 AWG", "aluminum": "2/0 AWG"},
            150: {"copper": "1/0 AWG", "aluminum": "3/0 AWG"},
            175: {"copper": "2/0 AWG", "aluminum": "4/0 AWG"},
            200: {"copper": "3/0 AWG", "aluminum": "250 MCM"},
            225: {"copper": "4/0 AWG", "aluminum": "300 MCM"},
            250: {"copper": "250 MCM", "aluminum": "350 MCM"},
            300: {"copper": "350 MCM", "aluminum": "500 MCM"},
            350: {"copper": "500 MCM", "aluminum": "700 MCM or 2 parallel 4/0"},
            400: {"copper": "600 MCM or 2 parallel 3/0",
                "aluminum": "900 MCM or 2 parallel 250"},
        }
        return

    def size_service_conductor(self,required_amps, material="copper"):
    

        material = material.lower()

        if material not in ["copper", "aluminum"]:
            raise ValueError("Material must be 'copper' or 'aluminum'")

        # Sort service ratings
        ratings = sorted(self.SERVICE_SIZING_GUIDE.keys())

        # Find next rating >= required amps
        for rating in ratings:
            if required_amps <= rating:
                return {
                    "service_rating": rating,
                    "conductor_size": self.SERVICE_SIZING_GUIDE[rating][material]
                }

        # If exceeds max guide
        raise ValueError("Required amps exceed 400A — parallel design required.")

    def get_service_entrance_size(self, material="copper"):
        print("Calculating total service load and required amps for the dwelling...")
        required_amps = self.service_amps()
        print(f"Total service load: {self.total_service_load} VA, which corresponds to {required_amps} A.")
        print("Calculating total neutral load and required amps for the dwelling...")
        required_amps_neutral = self.neutral_amps()
        print(f"Total neutral load: {self.total_neutral_load} VA, which corresponds to {required_amps_neutral} A.")
        ServiceSize = self.size_service_conductor(required_amps, material)
        NeutralSize = self.size_service_conductor(required_amps_neutral, material)
        return ServiceSize, NeutralSize

    
    def SetGroundingGuide(self):
        self.GROUNDING_LOOKUP_CU = {
            # 3 or 2 AWG
            "3 AWG": "8 AWG",
            "2 AWG": "8 AWG",

            # 1 or 1/0 AWG
            "1 AWG": "6 AWG",
            "1/0 AWG": "6 AWG",

            # 2/0 or 3/0 AWG
            "2/0 AWG": "4 AWG",
            "3/0 AWG": "4 AWG",

            # 4/0 – 350 MCM
            "4/0 AWG": "2 AWG",
            "250 MCM": "2 AWG",
            "300 MCM": "2 AWG",
            "350 MCM": "2 AWG",

            # 400 – 600 MCM
            "400 MCM": "1/0 AWG",
            "500 MCM": "1/0 AWG",
            "600 MCM": "1/0 AWG",

            # 700 – 1100 MCM
            "700 MCM": "2/0 AWG",
            "800 MCM": "2/0 AWG",
            "900 MCM": "2/0 AWG",
            "1000 MCM": "2/0 AWG",
            "1100 MCM": "2/0 AWG",
        }
        self.GROUNDING_LOOKUP_AL = {
            # 1 or 1/0 AWG
            "1 AWG": "6 AWG",
            "1/0 AWG": "6 AWG",

            # 2/0 or 3/0 AWG
            "2/0 AWG": "4 AWG",
            "3/0 AWG": "4 AWG",

            # 4/0 AWG or 250 MCM
            "4/0 AWG": "2 AWG",
            "250 MCM": "2 AWG",

            # 300 – 500 MCM
            "300 MCM": "1/0 AWG",
            "350 MCM": "1/0 AWG",
            "400 MCM": "1/0 AWG",
            "500 MCM": "1/0 AWG",

            # 600 – 800 MCM
            "600 MCM": "3/0 AWG",
            "700 MCM": "3/0 AWG",
            "800 MCM": "3/0 AWG",

            # 1000 – 1750 MCM
            "1000 MCM": "4/0 AWG",
            "1100 MCM": "4/0 AWG",
            "1250 MCM": "4/0 AWG",
            "1500 MCM": "4/0 AWG",
            "1750 MCM": "4/0 AWG",
        }


        return
    
    def get_grounding_conductor_size(self, entrance_size, material="copper"):
        entrance_size = entrance_size.strip().upper()

        if material == "copper":
            table = self.GROUNDING_LOOKUP_CU
        elif material == "aluminum":
            table = self.GROUNDING_LOOKUP_AL
        else:
            raise ValueError("Material must be 'copper' or 'aluminum'")

        if entrance_size not in table:
            raise ValueError(f"No grounding size found for {entrance_size}")

        return table[entrance_size]


