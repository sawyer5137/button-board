import { exec } from "child_process";
import os from "os";

export function getProcessId(processName) {
  return new Promise((resolve, reject) => {
    // Run the tasklist command to get all running processes
    exec("tasklist", (error, stdout, stderr) => {
      if (error) {
        reject(`Error executing tasklist: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`Error: ${stderr}`);
        return;
      }

      // Split the output into lines
      const lines = stdout.split("\n");
      for (const line of lines) {
        // Check if the line contains the process name
        if (line.toLowerCase().includes(processName.toLowerCase())) {
          // Extract the PID from the line
          const parts = line.trim().split(/\s+/); // Split by whitespace
          const pid = parts[1]; // PID is typically the second column in the tasklist output
          resolve(pid);
          return;
        }
      }

      // If the process is not found, resolve with null
      resolve(null);
    });
  });
}

export function killProcessById(pid) {
  return new Promise((resolve, reject) => {
    try {
      // Attempt to kill the process
      process.kill(pid, "SIGKILL");
      resolve(`Process with PID ${pid} has been killed.`);
    } catch (error) {
      // Handle errors (e.g., process does not exist or insufficient permissions)
      if (error.code === "ESRCH") {
        reject(`No process found with PID ${pid}.`);
      } else if (error.code === "EPERM") {
        reject(`Insufficient permissions to kill process with PID ${pid}.`);
      } else {
        reject(`Error killing process with PID ${pid}: ${error.message}`);
      }
    }
  });
}

export function getIP() {
  const nets = os.networkInterfaces();
  const ips = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        ips.push({ name, address: net.address });
      }
    }
  }
  return ips;
}
