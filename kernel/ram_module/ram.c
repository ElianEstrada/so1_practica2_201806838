#include <linux/kernel.h>
#include <linux/init.h>
#include <linux/module.h>
#include <linux/proc_fs.h>
#include <linux/seq_file.h>
#include <linux/mm.h>

MODULE_AUTHOR("Elian Saúl Estrada Urbina");
MODULE_DESCRIPTION("Ram Module - Get data for free memory, used memory and total memory");
MODULE_LICENSE("GPL");

struct sysinfo sys_info;

static int content_file(struct seq_file *file, void *v) {
    si_meminfo(&sys_info);
    seq_printf(file, "{\"total\": %ld", (sys_info.totalram * 4) / 1024);
    seq_printf(file, ", \"used\": %ld", ((sys_info.totalram - sys_info.freeram) * 4) / 1024);
    seq_printf(file, "}\n");
    return 0;
}

static int get_data(struct inode *inode, struct file *file) {
    return single_open(file, content_file, NULL);
}

static struct proc_ops data = {
        .proc_open = get_data,
        .proc_read = seq_read
};

static int __init add_module(void) {
    proc_create("ram_201806838", 0, NULL, &data);
    printk(KERN_INFO "201806838\n");
    return 0;
}

static void __exit remove_module(void) {
    remove_proc_entry("ram_201806838", NULL);
    printk(KERN_INFO "Sistemas Operativos I\n");
}

module_init(add_module);
module_exit(remove_module);
