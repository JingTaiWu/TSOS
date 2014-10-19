///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />
///<reference path="../os/jquery.d.ts" />
/* ------------
Control.ts
Requires globals.ts.
Routines for the hardware simulation, NOT for our client OS itself.
These are static because we are never going to instantiate them, because they represent the hardware.
In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
is the "bare metal" (so to speak) for which we write code that hosts our client OS.
But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
in both the host and client environments.
This (and other host/simulation scripts) is the only place that we should see "web" code, such as
DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)
This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */
//
// Control Services
//
var TSOS;
(function (TSOS) {
    var Control = (function () {
        function Control() {
        }
        Control.hostInit = function () {
            // Get a global reference to the canvas.  TODO: Move this stuff into a Display Device Driver, maybe?
            _Canvas = document.getElementById('display');
            _Buffer = document.getElementById('buffer');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext('2d');
            _BufferContext = _Buffer.getContext('2d');

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();

            // Check for our testing and enrichment core.
            if (typeof Glados === "function") {
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        };

        Control.hostLog = function (msg, source) {
            if (typeof source === "undefined") { source = "?"; }
            // Note the OS CLOCK.
            var clock = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date();

            // if the previous trace message is idle, update the first child
            if (_prevTraceMessage === msg) {
                $("#taHostLog").find('p').first().remove();
                var div = "<p>" + "<span class='label label-default'>" + source + "</span>" + " Time: " + now.toLocaleTimeString() + "." + "Clock: " + clock + "<br>" + " Message: " + msg + "</p>";
                $("#taHostLog").prepend(div);
            } else {
                // Build the log string.
                var div = "<p>" + "<span class='label label-default'>" + source + "</span>" + " Time: " + now.toLocaleTimeString() + "." + "Clock: " + clock + "<br>" + " Message: " + msg + "</p>";

                // Update the log console.
                var taLogDiv = $("#taHostLog");
                taLogDiv.prepend(div);
                // Optionally update a log database or some streaming service.
            }
        };

        //
        // Host Events
        //
        Control.hostBtnStartOS_click = function (btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu();
            _CPU.init();

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);

            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap();
        };

        Control.hostBtnHaltOS_click = function (btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");

            // Call the OS shutdown routine.
            _Kernel.krnShutdown();

            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        };

        Control.hostBtnReset_click = function (btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        };

        Control.stepModeButton = function (btn) {
            // enable/disable step mode
            _StepMode = !_StepMode;
            if (_StepMode == true) {
                // if it is step mode, the button should show disable
                $("#enableStepMode").toggleClass("btn-success", false);
                $("#enableStepMode").toggleClass("btn-danger", true);
                $("#enableStepMode").text("Disable Step Mode");

                // enable the arrow button
                $("#nextStep").removeAttr("disabled");
            } else {
                // if it is not step mode, the button should show enable
                $("#enableStepMode").toggleClass("btn-danger", false);
                $("#enableStepMode").toggleClass("btn-success", true);
                $("#enableStepMode").text("Enable Step Mode");

                // disable the arrow button
                $("#nextStep").attr("disabled", "disabled");
            }
        };

        Control.nextStepButton = function (btn) {
            // if it is step mode, wait for the button click
            // when clicked, generate an ISR
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(STEP_MODE_ISR, []));
        };
        return Control;
    })();
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
