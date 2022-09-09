obj-m += ram.o

all:
	make -C /lib/modules/$(shell uname -r)/build M=$(PWD) modules
	mv ram.ko ram_201806838.ko

clean:
	make -C /lib/modules/$(shell uname -r)/build M=$(PWD) clean

both:
	make add
	make remove

add:
	make
	sudo dmesg -C
	sudo insmod ram_201806838.ko
	sudo dmesg

remove:
	sudo dmesg -C
	sudo rmmod ram
	sudo dmesg
	make clean