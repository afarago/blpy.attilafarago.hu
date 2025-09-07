from pybricks.hubs import PrimeHub
from pybricks.parameters import Stop, Port, Direction
from pybricks.pupdevices import ColorSensor, Motor
from pybricks.robotics import DriveBase
from pybricks.tools import StopWatch, wait

hub = PrimeHub()
colorsensor_a = ColorSensor(Port.A)
motor_b = Motor(Port.B, Direction.COUNTERCLOCKWISE)
motor_c = Motor(Port.C)
motor_d = Motor(Port.D)
drivebase = DriveBase(motor_b, motor_c, 55.7, 117)

def demomission():
    drivebase.straight(393.75, Stop.HOLD)
    sw_linefollow = StopWatch()
    while not (sw_linefollow.time() < 1500):
        steer = colorsensor_a.reflection() - 40
        value = 500
        secondary_value = (50 - p) * 2 / 100 * value
        motor_b.run(value if steer>=0 else secondary_value)
        motor_c.run(value if steer<=0 else secondary_value)
    drivebase.stop()
    drivebase.straight(43.75, Stop.HOLD)
    motor_d.run_angle(250, 60)
    wait(2000)
    motor_d.run_time(-250, 1000)
    drivebase.straight(-700, Stop.HOLD)

demomission()
