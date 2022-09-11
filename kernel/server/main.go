package main

import (
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"log"
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

		catStat, err2 := exec.Command("sh", "-c", "cat /proc/stat | grep cpu").Output()

		if err2 != nil {
			log.Fatal(err)
		}

		cpuLine := strings.Split(string(catStat), "\n")[0]

		values := strings.Fields(cpuLine)
		idleTime, _ := strconv.ParseUint(values[3], 10, 64)
		totalTime := uint64(0)

		for _, item := range values {
			value, _ := strconv.ParseUint(item, 10, 64)
			totalTime += value
		}

		if count > 0 {
			deltaIdleTime := idleTime - prevIdleTime
			deltaTotalTime := totalTime - prevTotalTime
			cpuUsage := (1.0 - float64(deltaIdleTime)/float64(deltaTotalTime)) * 100.0
			catCpuString += fmt.Sprintf("\"cpu_usage\": %f}", 100-cpuUsage)
		} else {
			catCpuString += fmt.Sprintf("\"cpu_usage\": %f}", 0.0)
		}

		prevIdleTime = idleTime
		prevTotalTime = totalTime

		count++

		fmt.Println(catCpuString)
		fmt.Println(catRamString)

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
