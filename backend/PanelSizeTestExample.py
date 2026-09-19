from Dwelling_v2 import Dwelling, Appliance

# Example usage
if __name__ == "__main__":
    # Create some appliances
    Disposal = Appliance("Disposal", 400,120)
    compactor = Appliance("Compactor", 800,120)
    BlowerMotor = Appliance("Blower Motor", 4.5*120,120)
    Dishwasher = Appliance("Dishwasher", 1400,120)
    WaterHeater = Appliance("Water Heater", 4800,240)
    # ClothesWasher = Appliance("Clothes Washer", 403.846,120)
    ClothesDryer = Appliance("Clothes Dryer", 5000,240)
    Range = Appliance("Electric Range", 12000)
    SpaceHeater = Appliance("HVAC", 20000)
    # Fridge = Appliance("Refrigerator", 130,120)

    # Create a dwelling with 2000 square feet and the appliances
    my_dwelling = Dwelling(square_feet=1600, appliances=[Disposal, compactor, BlowerMotor, Dishwasher, ClothesDryer, Range, WaterHeater, SpaceHeater])
    ServiceSize,NeutralSize = my_dwelling.get_service_entrance_size(method="Optional")
    print(f"Final Service and Neutral Conductor: {ServiceSize}, {NeutralSize}.")
    ServiceSize,NeutralSize = my_dwelling.get_service_entrance_size(method="Standard")

    print(f"Final Service and Neutral Conductor: {ServiceSize}, {NeutralSize}.")
    GroundSize = my_dwelling.get_grounding_conductor_size(ServiceSize["conductor_size"], material="copper")
    print(f"Final Grounding Conductor Size: {GroundSize}.")

    # --- Krarti worked example (1500 sqft, Electric Range 12 kW, Clothes Dryer 5.5 kW) ---
    # Standard method: service load 18600 VA -> 77.5 A -> 100 A service, 2 AWG (Cu);
    # neutral load 14550 VA -> 60.6 A -> 6 AWG (Cu) per Table 6.1 ampacities.
    krarti_dwelling = Dwelling(
        square_feet=1500,
        appliances=[
            Appliance("Electric Range", 12000, 240),
            Appliance("Clothes Dryer", 5500, 240),
        ],
    )
    KrartiService, KrartiNeutral = krarti_dwelling.get_service_entrance_size(method="Standard")
    assert KrartiService["conductor_size"] == "2 AWG", KrartiService
    assert KrartiNeutral["conductor_size"] == "6 AWG", KrartiNeutral
    print(f"Krarti example check passed: Service {KrartiService}, Neutral {KrartiNeutral}.")