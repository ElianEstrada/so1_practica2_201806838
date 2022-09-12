> # Practica 2
> ### Elian Saúl Estradad Urbina
> #### 201806838

# Manual Técnico

## Módulos

Los módulos para obtener la información del sistema se crearon en el lenguaje de programación C, utilizando cabeceras propias del sistema y los struct que estos proporcionan como task_struct, list_head, etc.

+ **Makefile:** Archivo para compila y generar el módulo, también para limpiarlo e instalar o removerlo en el kernel
    ```makefile
    obj-m += <modulo>.o

    #etiqueta principal, que se encarga de crear el módulo.
    all: 
        make -C /lib/modules/$(shell uname -r)/build M=$(PWD) modules
        mv <modulo>.ko <modulo>_201806838.ko #cambiando el nombre.

    #etiqueta que sirve para limpiar todos los archivos generados
    clean:
        make -C /lib/modules/$(shell uname -r)/build M=$(PWD) clean

    #etiqueta de prueba para agregar y remover el modulo directamente
    both:
        make add
        make remove

    #etiqueta para agregar el módulo
    add:
        make        #llama a la primera etiqueta (all) para crear el módulo
        sudo dmesg -C    #limpia los mensajes
        sudo insmod <modulo>_201806838.ko    #instala el módulo en el kernel
        sudo dmesg    # Muestra la salida del insmod

    #etiqueta para remover el módulo
    remove:
        sudo dmesg -C        #limpia los mensajes
        sudo rmmod cpu       #remueve el módulo del kernel
        sudo dmesg           #muestra los mensajes de rmmod
        make clean           #llama a la etiqueta clean
    ```

+ **CPU Modulo:**
    
    ```c
    /*=========Cabeceras=========*/
    #include <linux/kernel.h>
    #include <linux/init.h>
    #include <linux/module.h>
    #include <linux/proc_fs.h>
    #include <linux/seq_file.h>
    #include <linux/sched.h>
    #include <linux/mm.h>

    /*=========Metadatos=========*/
    MODULE_AUTHOR("Elian Saúl Estrada Urbina");
    MODULE_DESCRIPTION("CPU Module - Get data for process, PID, name, child and more");
    MODULE_LICENSE("GPL");

    /*=========Structs útiles=========*/
    struct task_struct *task;         //Procesos
    struct task_struct *task_child;   //Procesos hijos
    struct list_head *list;           //para la lista de procesos hijos

    char *name = "cpu_201806838";     //nombre del módulo

    static int content_file(struct seq_file *file, void *v) {
        unsigned long rss;

        seq_printf(file, "{\"process\":[");

        int count_running = 0, count_sleeping = 0, count_zombie = 0, count_stopped = 0;
        
        //Recorrer cada proceso
        for_each_process(task) {
            
            //Saber el tipo de proceso
            switch (task->__state) {
                case TASK_RUNNING:
                    count_running++;
                    break;
                case EXIT_TRACE:
                case TASK_DEAD:
                    count_zombie++;
                    break;
                case TASK_STOPPED:
                    count_stopped++;
                    break;
                default:
                    count_sleeping++;
            }

            //Saber si usa RAM
            if (task->mm){
                //Obtenemos la cantidad de ram (en bytes) de cada proceso
                rss = get_mm_rss(task->mm) << PAGE_SHIFT;
                seq_printf(file, "{\"pid\": %d, \"name\": \"%s\", \"user\": %d, \"state\": %i, \"ram\": %lu, \"children\": [", task->pid, task->comm, task->cred->uid, task->__state, rss);
            } else {
                seq_printf(file, "{\"pid\": %d, \"name\": \"%s\", \"user\": %d, \"state\": %i, \"ram\": %d, \"children\": [", task->pid, task->comm, task->cred->uid, task->__state, 0);
            }

            //para la lista de hijos de procesos
            list_for_each(list, &task->children) {
                task_child = list_entry(list, struct task_struct, sibling);

                if (list->next == &task->children) {
                    seq_printf(file, "{\"pid\": %d, \"name\": \"%s\" }", task_child->pid, task_child->comm);
                } else {
                    seq_printf(file, "{\"pid\": %d, \"name\": \"%s\" },", task_child->pid, task_child->comm);
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
    ```

+ **RAM Modulo:**

    ```c
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
    char *name = "ram_201806838";

    static int content_file(struct seq_file *file, void *v) {
        si_meminfo(&sys_info);
        seq_printf(file, "{\"total\": %ld", (sys_info.totalram << PAGE_SHIFT));
        seq_printf(file, ", \"used\": %ld", ((sys_info.totalram - sys_info.freeram) << PAGE_SHIFT));
        seq_printf(file, "}");
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
        proc_create(name, 0, NULL, &data);
        printk(KERN_INFO "201806838\n");
        return 0;
    }

    static void __exit remove_module(void) {
        remove_proc_entry(name, NULL);
        printk(KERN_INFO "Sistemas Operativos I\n");
    }

    module_init(add_module);
    module_exit(remove_module);
    ```


## Back - Golang

+ **Dependencias:**

    + github.com/go-sql-driver/mysql

+ **Dockerfile:**

    ```dockerfile
    FROM golang:1.17
    WORKDIR /home/server
    COPY . .
    RUN go mod download
    RUN go get github.com/go-sql-driver/mysql
    CMD ["go", "run", "main.go"]
    ```

+ **main.go:**

    ```golang
    package main

    import (
        "bufio"
        "database/sql"
        "fmt"
        _ "github.com/go-sql-driver/mysql"
        "log"
        "os"
        "os/exec"
        "strconv"
        "strings"
        "time"
    )

    func main() {

        count := 0
        var prevIdleTime, prevTotalTime uint64

        for {

            catCpuReader, err := exec.Command("sh", "-c", "cat /proc/cpu_201806838").Output()

            if err != nil {
                log.Fatal(err)
            }

            catRamReader, err := exec.Command("sh", "-c", "cat /proc/ram_201806838").Output()

            if err != nil {
                log.Fatal(err)
            }

            catCpuString := string(catCpuReader)
            catRamString := string(catRamReader)

            file, err := os.Open("/proc/stat")

            if err != nil {
                log.Fatal(err)
            }

            scanner := bufio.NewScanner(file)
            scanner.Scan()

            fmt.Println(scanner.Text()[5:])
            cpuLine := scanner.Text()[5:]
            file.Close()

            if err := scanner.Err(); err != nil {
                log.Fatal(err)
            }

            values := strings.Fields(cpuLine)
            idleTime, _ := strconv.ParseUint(values[3], 10, 64)
            totalTime := uint64(0)

            for _, item := range values[1:] {
                value, _ := strconv.ParseUint(item, 10, 64)
                totalTime += value
            }

            if count > 0 {
                deltaIdleTime := idleTime - prevIdleTime
                deltaTotalTime := totalTime - prevTotalTime
                cpuUsage := (1.0 - float64(deltaIdleTime)/float64(deltaTotalTime)) * 100.0
                catCpuString += fmt.Sprintf("\"cpu_usage\": %f}", cpuUsage)
            } else {
                catCpuString += fmt.Sprintf("\"cpu_usage\": %f}", 0.0)
            }

            prevIdleTime = idleTime
            prevTotalTime = totalTime

            count++

            db, err := sql.Open("mysql", "root:sopes12022@tcp(35.223.130.73:3306)/practice2")
            if err != nil {
                panic(err.Error())
            }

            defer db.Close()

            query := fmt.Sprintf("INSERT INTO cpu_module(content) VALUE('%s');", catCpuString)
            _, err = db.Exec(query)

            if err != nil {
                panic(err.Error())
            }

            query = fmt.Sprintf("INSERT INTO ram_module(content) VALUE('%s');", catRamString)
            _, err = db.Exec(query)

            if err != nil {
                panic(err.Error())
            }

            time.Sleep(time.Second)
        }
    }
    ```


## Api - NodeJS

+ **Dependencias:**

    + NodeJS
    + Express

+ **Dockerfile:**

    ```dockerfile
    FROM node:latest
    WORKDIR /home/server
    COPY . .
    RUN npm install
    CMD ["npm", "start"]
    ```


## Cliente - ReactJS

+ **Dependencias:**

    + ReactJS
    + React-Router-Dom
    + Primerreact
    + Primeicons

+ **DockerFile:**

    ```dockerfile
    FROM node:latest
    WORKDIR /home/client
    COPY . .
    RUN npm install
    CMD ["npm", "start"]
    ```
