Welcome to JingleJangleOS
=========================

-	This is my Fall 2014 Operating Systems class initial project.
-	See http://www.labouseur.com/courses/os/ for details.

Progress Check
==============

1.	iProject 1 (Complete!!)
2.	iProject 2 (DONE!)
3.	iProject 3 (In Progress)
4.	iProject 4

To Do List
==========

Shell Related
-------------

-	~~Add a shell command, *clearmem*, to clear all memory partitions.~~
-	~~Allow the user to load three programs into memory at once.~~
-	Add a shell command, *runall*, to execute all the programs at once
-	~~Add a shell command, *quantum (int)* , to let the user set the
 **Round Robin quantum** (measured in clock ticks)~~
-	Display the Ready queue and its (PCB) contents (including process state) in real time.
-	~~Add a shell command, *ps*, to display the PIDs of all active processes.~~
-	Add a shell command, *kill (pid)*, to kill an active process.

Memory Related
--------------

-	~~Store multiple programs in memory, each in their own partition, allocated by the client OS~~
-	~~Add base and limit registers to your core memory access code in the host OS and to your PCB object in the client OS.~~
-	~~Enforce memory partition boundaries at all times.~~

Process Related
---------------

-	Create a Resident list for the loaded processes.
-	Create a Ready queue for the running processes.
-	Instantiate a PCB for each loaded program and put it in the Resident List.

Scheduling Related
------------------

-	Develop a CPU scheduler in the client OS using Round Robin scheduling with the user-specified quantum measured in clock ticks(default= 6)
	-	Make the client OS control the host CPU with the client OS CPU scheduler.
	-	Log all scheduling events
-	Implement context switches with software interrupts. Be sure to update the mode bit(if appropriate), the PCBs and the Ready Queue
-	Detect and gracefully handle errors like invalid op codes, missing operands, and most importantly, memory out of bounds access attempts.
