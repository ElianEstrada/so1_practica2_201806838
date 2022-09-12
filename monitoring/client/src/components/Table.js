import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Knob } from 'primereact/knob';

import './Table.css';


const Table = () => {

    const [process, setProcess] = useState([]);
    const [task, setTask] = useState({});
    const [cpu, setCpu] = useState(0);
    const [ram, setRam] = useState({});
    const [expandedRows, setExpandedRows] = useState(null);

    useEffect(() => {
        let id = setInterval(() => {
            fetch('http://localhost:4000/cpu', {
                method: "GET"
            })
                .then(res => res.json())
                .then(data => {
                    setProcess(data.data.process);
                    setTask(data.data.summary);
                    setCpu(data.data.cpu_usage);
                });

            fetch('http://localhost:4000/ram', {
                method: "GET"
            })
                .then(res => res.json())
                .then(data => setRam(data.data));

        }, 2000)

        return () => clearInterval(id);
    }, []);

    const ramTemplate = (rowData) => {
        return <>{((rowData.ram * 100) / ram.total).toFixed(2)}%</>
    }

    const rowExpansionTemplate = (data) => {
        return (
            <div className="orders-subtable">
                <h5>Children of {data.name}</h5>
                <DataTable value={data.children} responsiveLayout="scroll">
                    <Column field='pid' header="PID" />
                    <Column field='name' header="Name" />
                </DataTable>
            </div>
        );
    }

    return (
        <>  
            <h1 className='title'>Monitoring System</h1>
            <div className='container'>
                <Card style={{ marginBottom: "2rem" }}>
                    <div className="monitor">
                        <div className="ram">
                            <Knob value={((ram.used * 100) / ram.total).toFixed(2)} size={300}
                                valueColor={"var(--blue-500)"}
                                rangeColor={"var(--gray-700)"}
                            />
                            <h3 style={{ textAlign: "center" }}>Ram (%)</h3>
                        </div>
                        <div className="cpu">
                            <Knob value={(cpu).toFixed(2)} size={300}
                                valueColor={"var(--red-500)"}
                                rangeColor={"var(--gray-700)"}
                            />
                            <h3 style={{ textAlign: "center" }}>Cpu (%)</h3>
                        </div>
                    </div>
                </Card>
                <Card style={{ marginBottom: "2rem" }}>
                    <div className="summary-task">
                        <div className='task'>
                            <Card title="Total Task" style={{ background: "var(--green-500)" }}>
                                {task.running + task.sleeping + task.stopped + task.zombie}
                            </Card>
                        </div>
                        <div className='task'>
                            <Card title="Running" style={{ background: "var(--blue-500)" }}>
                                {task.running}
                            </Card>
                        </div>
                        <div className='task'>
                            <Card title="Sleeping" style={{ background: "var(--yellow-500)" }}>
                                {task.sleeping}
                            </Card>
                        </div>
                        <div className='task'>
                            <Card title="Stopped" style={{ background: "var(--red-500)" }}>
                                {task.stopped}
                            </Card>
                        </div>
                        <div className='task'>
                            <Card title="Zombie" style={{ background: "var(--gray-500)" }}>
                                {task.zombie}
                            </Card>
                        </div>
                    </div>
                </Card>
                <div className="datatable-rowexpansion-demo">
                    <div className="card">
                        <DataTable value={process} expandedRows={expandedRows} onRowToggle={(e) => setExpandedRows(e.data)}
                            responsiveLayout="scroll"
                            rowExpansionTemplate={rowExpansionTemplate} dataKey="pid">
                            <Column expander style={{ width: '3em' }} />
                            <Column field='pid' header="PID" />
                            <Column field='name' header="Name" />
                            <Column field='user' header="User" />
                            <Column field='state' header="State" />
                            <Column field='ram' header="RAM" body={ramTemplate} />
                        </DataTable>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Table;