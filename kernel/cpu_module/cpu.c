#include <linux/kernel.h>
#include <linux/init.h>
#include <linux/module.h>
#include <linux/proc_fs.h>
#include <linux/seq_file.h>
#include <linux/sched.h>
#include <linux/mm.h>

MODULE_AUTHOR("Elian Saúl Estrada Urbina");
MODULE_DESCRIPTION("CPU Module - Get data for process, PID, name, child and more");
MODULE_LICENSE("GPL");

struct task_struct *task;
char *name = "cpu_201806838";

static int content_file(struct seq_file *file, void *v) {
//    task = current;
//    seq_printf(file, "\"PID\": %i", task->pid);
//    seq_printf(file, "\n\"State\": %i", task->__state);
//    seq_printf(file, "\n{\"prueba_cpu\": Elian }");

    unsigned long rss;

    for_each_process(task) {
        if (task->mm){
            rss = get_mm_rss(task->mm) << PAGE_SHIFT;
            seq_printf(file, "\nParent PID: %d PROCESS: %s USER: %d STATE: %i RAM: %lu megabytes", task->pid, task->comm, task->cred->uid, task->__state, (rss / (1024 * 1024)));
        } else {
            seq_printf(file, "\nParent PID: %d PROCESS: %s USER: %d STATE: %i", task->pid, task->comm, task->cred->uid, task->__state);
        }
    }
    return 0;
}

static int get_data(struct inode *inode, struct file *file){
    return single_open(file, content_file, NULL);
}

static struct proc_ops data = {
        .proc_open = get_data,
        .proc_read = seq_read
};

static int __init add_module(void) {
    proc_create(name, 0, NULL, &data);
    printk(KERN_INFO "Elian Saúl Estrada Urbina\n");
    return 0;
}

static void __exit remove_module(void) {
    remove_proc_entry(name, NULL);
    printk(KERN_INFO "Segundo Semestre 2022\n");
}

module_init(add_module);
module_exit(remove_module);