from Dwelling import Dwelling, Appliance

if __name__ == "__main__":
    Disposal = Appliance("Disposal", 400,120)
    compactor = Appliance("Compactor", 800,120)
    BlowerMotor = Appliance("Blower Motor", 4.5*120,120)
    Dishwasher = Appliance("Dishwasher", 1400,120)
    WaterHeater = Appliance("Water Heater", 4800,240)
    ClothesDryer = Appliance("Clothes Dryer", 5000,240)
    Range = Appliance("Electric Range", 12000)
    SpaceHeater = Appliance("Space Heater", 20000)

    my_dwelling = Dwelling(square_feet=1600, appliances=[Disposal, compactor, BlowerMotor, Dishwasher, WaterHeater, ClothesDryer, Range, SpaceHeater])
    ServiceSize,NeutralSize = my_dwelling.get_service_entrance_size()
    print(f"Final Service and Neutral Conductor: {ServiceSize}, {NeutralSize}.")
    GroundSize = my_dwelling.get_grounding_conductor_size(ServiceSize["conductor_size"], material="copper")
    print(f"Final Grounding Conductor Size: {GroundSize}.")