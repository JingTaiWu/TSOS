/// <reference path="jquery.d.ts"/>
/*
  PcbDisplay - manages the display in the client OS
*/

module TSOS {
  export class PcbDisplay {
    private pcbTableBody;
    constructor() {
      this.pcbTableBody = $("#pcbDisplay > tbody");
    }

    // update the entire table
    public update() {
      // empty the table first
      this.pcbTableBody.empty();
      var residentQueue = _PCB.residentQueue;
      for (var i = 0; i < residentQueue.length; i++) {
        var process = residentQueue[i];
        var cols = "<td>" + process.pid + "</td>" +
                   "<td>" + process.pc + "</td>" +
                   "<td>" + process.ir + "</td>" +
                   "<td>" + process.acc + "</td>" +
                   "<td>" + process.xFlag + "</td>" +
                   "<td>" + process.yFlag + "</td>" +
                   "<td>" + process.zFlag + "</td>";
        var row = "<tr id = 'pid-" + process.pid + "'>" + cols + "</tr>";
        $("#pcbDisplay > tbody:last").append(row);
      }
    }

    // update a single row given a process id
    public updateProcess(pid : number) {
      var residentQueue = _PCB.residentQueue;
      for (var i = 0; i < residentQueue.length; i++) {
        var process = residentQueue[i];
        // if it matches, update the row
        if(process.pid == pid) {
          // get the html element
          var processRow = $("#pid-" + pid);
          processRow.empty();
          var cols = "<td>" + process.pid + "</td>" +
                     "<td>" + process.pc + "</td>" +
                     "<td>" + process.ir + "</td>" +
                     "<td>" + process.acc + "</td>" +
                     "<td>" + process.xFlag + "</td>" +
                     "<td>" + process.yFlag + "</td>" +
                     "<td>" + process.zFlag + "</td>";
          processRow.append(cols);
        }
      }
    }
  }
}
