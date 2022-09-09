obj-m += cpu.o

all:
	make -C /lib/modules/$(shell uname -r)/build M=$(PWD) modules
	mv cpu.ko cpu_201806838.ko

clean:
	make -C /lib/modules/$(shell uname -r)/build M=$(PWD) clean

both:
	make add
	make remove

add:
	make
	sudo dmesg -C
	sudo insmod cpu_201806838.ko
	sudo dmesg

remove:
	sudo dmesg -C
	sudo rmmod cpu
	sudo dmesg
	make clean