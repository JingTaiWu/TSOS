Welcome to JingleJangleOS
=========================

-	This is my Fall 2014 Operating Systems class initial project.
-	See http://www.labouseur.com/courses/os/ for details.

Progress Check
==============

1.	iProject 1 (Complete!!)
2.	iProject 2 (DONE!)
3.	iProject 3 (完成)
4.	iProject 4 (Now in Progress)

To Do List
==========

Shell Related
-------------

- ~~*create* (filename) --- Create the filenmae and display a message denoting success or failure.~~
- ~~*read* (filename) --- Read and display the contents of filename or display an error if something went wrong.~~
- ~~*write* (filename) --- Write the data inside the quotes to filename and isplay a message denoting success or failure.~~
- ~~*delete* (filename) "data" --- Write the data inside the quotes to filename and display a message denoting success or failure.~~
- ~~*format* --- Initialize all blocks in all sectors in all tracks and display a message denoting success or failure.~~
- ~~*ls* --- list the files currently stored on the disk.~~
- ~~*setschedule* --- allow the user to select a CPU scheduling algorithm {rr. fcfs, priority}~~
- ~~*getschedule* --- return the currently selected cpu scheduling algorithm.~~


File System Related
--------------

- ~~Implement a file system in HTML5 web storage as discussed in class.~~
- ~~Include a file system viewer in your OS interface.~~
- ~~File System Device for all of the functional requirements noted above.~~
- ~~load the fsDD in a similar manner as the keyboard device driver.~~
- ~~evelop your fsDD to insulate and encapsulate the implementation of the kernel-level I/O operations from the byte-level details
of your individual blocks on the lcoal storage.~~


Scheduling Related
------------------

- ~~first-come, first-served (FCFS)~~
- ~~non-preemptive priority~~

SOMETHING THAT'S WORTH 70 POINTS
--------------------------------
- Allow the OS to execute four concurrent user process by writing roll-out and roll-in routines to
    - take a ready process and store it to the disk via your fsDD.
    - load a swapped-out process and place it in the ready queue.
    - your ready queue should denote which processes are where.
