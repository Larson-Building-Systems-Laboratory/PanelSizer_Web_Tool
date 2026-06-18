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