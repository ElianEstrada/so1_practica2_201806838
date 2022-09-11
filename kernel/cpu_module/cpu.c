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
struct task_struct *task_child;
struct list_head *list;

char *name = "cpu_201806838";

static int content_file(struct seq_file *file, void *v) {
    unsigned long rss;

    seq_printf(file, "{\"process\":[");

    int count_running = 0, count_sleeping = 0, count_zombie = 0, count_stopped = 0;

    for_each_process(task) {

        switch (task->__state) {
            case 0:
                count_running++;
                break;
            case 4:
                count_zombie++;
                break;
            case 8:
                count_stopped++;
                break;
            default:
                count_sleeping++;
        }

        if (task->mm){
            rss = get_mm_rss(task->mm) << PAGE_SHIFT;
            seq_printf(file, "{\"pid\": %d, \"name\": %s, \"user\": %d, \"state\": %i, \"ram\": %lu, \"children\": [", task->pid, task->comm, task->cred->uid, task->__state, rss);
        } else {
            seq_printf(file, "{\"pid\": %d, \"name\": %s, \"user\": %d, \"state\": %i, \"ram\": %d, \"children\": [", task->pid, task->comm, task->cred->uid, task->__state, 0);
        }

        list_for_each(list, &task->children) {
            task_child = list_entry(list, struct task_struct, sibling);

            if (list->next == &task->children) {
                seq_printf(file, "{\"pid\": %d, \"name\": %s }", task_child->pid, task_child->comm);
            } else {
                seq_printf(file, "{\"pid\": %d, \"name\": %s },", task_child->pid, task_child->comm);
            }
        }

        if (next_task(task) == &init_task) {
            seq_printf(file, "]}");
        } else {
            seq_printf(file, "]},");
        }
    }

    seq_printf(file, "],\"summary\": {\"running\": %d, \"sleeping\": %d, \"stopped\": %d, \"zombie\": %d },", count_running, count_sleeping, count_stopped, count_zombie);

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