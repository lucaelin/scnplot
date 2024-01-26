'use strict';

function createTD(value, classList) {
  let td = document.createElement('td');
  if (!classList) classList = [];
  td.classList.add(...classList);
  if (typeof value === 'boolean') {
    td.innerText = value?'\u2713':'';
    td.classList.add('boolean', value?'true':'false');
  } else {
    td.innerText = value;
    td.classList.add('text');
  }
  return td;
}

function createHeader(names) {
  let tr = document.createElement('tr');

  names.forEach((text)=>{
    let td = document.createElement('th');
    td.innerText = text;
    tr.appendChild(td);
  });

  return tr;
}

function createTR(id, data) {
  let tr = document.createElement('tr');
  tr.classList.add(id%2?'odd':'even');

  data.forEach((entry)=>{
    if(entry instanceof Array)
      return tr.appendChild(createTD(entry[0], entry.slice(1)))
    return tr.appendChild(createTD(entry))
  });
  return tr;
}

function createTable(classes, name, header, numch, datafn) {
  let dom = document.createElement('div');
  dom.classList.add('table', ...classes);
  let h2 = document.createElement('h2');
  h2.innerText = name;
  dom.appendChild(h2);

  let table = document.createElement('table');
  table.appendChild(createHeader(header));
  for (let ch = 1; ch<=numch; ch++) {
    table.appendChild(datafn(ch));
  }
  dom.appendChild(table);
  return dom;
}

function getFXName(scn, short) {
  // TODO: find missing names and plot them
  return ({
    RPLT: 'Platereverb',
    DLY: 'Delay',
    CMB: 'Combinator',
    FAC: 'FAC (?)',
    EXC: 'Exciter',
    WAVD: 'Wavedesigner',
    P1A: 'P1A (?)',
    HALL: 'Hallreverb',
    GEQ: 'GraphicEq',
  })[short];
}

function getPhysicalIn(scn, id) {
  if(id==0) return '';
  if(scn.version === 'X-Air') {
    return id;
  }
  return id.toString().padStart(2, '0') + ': ' + getPhysicalName(scn, id);
}

/**
 * Returns the name of the physical input routed to the channel id provided
 *
 * @param {Object} scn The JSON object representation of the X32 Scene file
 * @param {number} id A channel id to look up the input of
 * @returns {string} String representation of the physical input
 */
function getPhysicalName(scn, id) {
  // import all channel routing blocks (1-4 + Aux routing)
  let IN = scn.config.routing.IN.value;

  // check if channel id falls within the routable channels
  if(id <= 38) {
    let ingroup = IN[Math.floor((id-1)/8)] // grab the relevant input group for the specified channel
    let groupid = ((id-1)%8+1) // calculate the relative channel id within the input group
    let outputname = groupid.toString(); // set the output name to the groupid as a fallback
    let grouptype = "";

    // check if the input group is a local input group
    if(ingroup.slice(0,1) === "A") {
      grouptype = "A"
    }
    if(ingroup.slice(0,1) === "B") {
      grouptype = "B"
    }
    if(ingroup.slice(0,2) === "AN") {
      grouptype = "AN"
    }
    if(ingroup.slice(0,3) === "AUX") {
      grouptype = "AUX"
    }
    if(ingroup.slice(0,3) === "UIN") {
      grouptype = "UIN"
    }
    if(ingroup.slice(0,4) === "CARD") {
      grouptype = "CARD"
    }

    let groupchs = ingroup.slice(grouptype.length).split("-").map((ch) => parseInt(ch));

    // get relative channel based on channel group
    let relativech = groupchs[0]+groupid-1;

    switch(grouptype) {
      case "A":
        outputname = "AES50-A " + relativech;
        break;
      case "B":
        outputname = "AES50-B " + relativech;
        break;
      case "AN":
        outputname = "Local " + relativech;
        break;
      case "AUX":
        outputname = "Aux In " + relativech;
        break;
      case "UIN":
        // grab the input userrouting array from the scene object
        let userins = scn.config.userrout.in.value;
        // use the getUserInName function to grab the corresponding name for the input
        outputname = getUserInName(userins[relativech-1]);
        break;
      case "CARD":
        outputname = "Card In " + relativech;
        break;
    }

    if(groupchs[1] < relativech && grouptype != "AUX") {
      outputname = "Off";
    }
    // return the mapped input in combination with the actual physically routed input
    return outputname;
  }

  // return the appropriate value for any fixed routing items
  return ({
    39: 'USB-Player L',
    40: 'USB-Player R',
    41: 'FX 1L',
    42: 'FX 1R',
    43: 'FX 2L',
    44: 'FX 2R',
    45: 'FX 3L',
    46: 'FX 3R',
    47: 'FX 4L',
    48: 'FX 4R',
    49: 'BUS 01',
    50: 'BUS 02',
    51: 'BUS 03',
    52: 'BUS 04',
    53: 'BUS 05',
    54: 'BUS 06',
    55: 'BUS 07',
    56: 'BUS 08',
    57: 'BUS 09',
    58: 'BUS 10',
    59: 'BUS 11',
    60: 'BUS 12',
    61: 'BUS 13',
    62: 'BUS 14',
    63: 'BUS 15',
    64: 'BUS 16',
  })[id];
}

/**
 * Grab the correct input name for any given user input mapping
 *
 * @param {number} id Mapped user input channel id
 * @returns {string} Corresponding physical input name
 */
function getUserInName(id) {
  // Define a mutable user input variable
  let userin = id;
  // return for unmapped channel config
  if(userin == 0) {
    return "Off"
  }
  // check for local inputs
  if(userin <= 32) {
    return "Local " + userin;
  }
  // subtract local inputs if no match was found
  userin = userin - 32;

  if(userin <= 48) {
    return "AES50-A " + userin;
  }
  userin = userin - 48;

  if(userin <= 48) {
    return "AES50-B " + userin;
  }
  userin = userin - 48;

  if(userin <= 32) {
    return "Card In " + userin;
  }
  userin = userin - 32;

  if(userin <= 6) {
    return "Aux In " + userin;
  }
  // Subtract an extra digit to allow for simple boolean operator
  userin = userin - 6 - 1;

  return !userin ? "Talkback Int" : "Talkback Ext"
}

function createChannel(scn, classes) {
  let name = 'Channel';
  let header = ['ch', 'link', 'name', 'lowcut', 'gate', 'dyn', 'insert', 'physical'];
  let numch = Object.keys(scn.ch).length;

  return createTable(classes, name, header, numch, (id)=>{
    let ch = id.toString().padStart(2, '0');
    let config = scn.ch[ch];
    let link = scn.config.chlink.value[Math.floor((id-1)/2)];
    let insert = scn.version!=='X-Air'?config.insert.value:[config.insert.value[0],'POST',config.insert.value[1]];
    return createTR(ch, [
      ch,                                                         // CHANNEL NUMBER
      [link==='ON', 'link'],                                      // STEREO LINK
      [config.config.value[0], 'color-'+config.config.value[2]],  // NAME
      config.preamp.value[2]==='ON',                              // LOWCUT
      config.gate.value[0]==='ON',                                // GATE
      config.dyn.value[0]==='ON',                                 // COMPRESSOR
      insert[0]==='ON'?insert[2]:'',                              // INSERT
      getPhysicalIn(scn, config.config.value[3]),                 // PHYSICAL
    ]);
  });
}
function createAux(scn, classes) {
  let name = 'Aux';
  let header = ['ch', 'link', 'name', 'physical'];
  let numch = Object.keys(scn.auxin).length;

  return createTable(classes, name, header, numch, (id)=>{
    let ch = scn.version!='X-Air'?id.toString().padStart(2, '0'):id.toString();
    let config = scn.auxin[ch];
    let link =  scn.config.auxlink.value[Math.floor((id-1)/2)];
    return createTR(ch, [
      ch,                                                         // CHANNEL NUMBER
      [link==='ON', 'link'],                                      // STEREO LINK
      [config.config.value[0], 'color-'+config.config.value[2]],  // NAME
      getPhysicalIn(scn, config.config.value[3]),                 // PHYSICAL
    ]);
  });
}
function createBus(scn, classes) {
  let name = 'Bus';
  let header = ['ch', 'link', 'name', 'dyn', 'insert'];
  let numch = Object.keys(scn.bus).length;

  return createTable(classes, name, header, numch, (id)=>{
    let ch = scn.version!='X-Air'?id.toString().padStart(2, '0'):id.toString();
    let config = scn.bus[ch];
    let link = scn.config.buslink.value[Math.floor((id-1)/2)];
    let insert = scn.version!=='X-Air'?config.insert.value:[config.insert.value[0],'POST',config.insert.value[1]];
    return createTR(ch, [
      ch,                                                         // CHANNEL NUMBER
      [link==='ON', 'link'],                                      // STEREO LINK
      [config.config.value[0], 'color-'+config.config.value[2]],  // NAME
      config.dyn.value[0]==='ON',                                 // COMPRESSOR
      insert[0]==='ON'?insert[2]:'',                              // INSERT
    ]);
  });
}
function createMatrix(scn, classes) {
  let name = 'Matrix';
  let header = ['ch', 'link', 'name', 'insert'];
  let numch = Object.keys(scn.mtx).length;

  return createTable(classes, name, header, numch, (id)=>{
    let ch = scn.version!='X-Air'?id.toString().padStart(2, '0'):id.toString();
    let config = scn.mtx[ch];
    let link = scn.config.mtxlink.value[Math.floor((id-1)/2)];
    return createTR(ch, [
      ch,                                                         // CHANNEL NUMBER
      [link==='ON', 'link'],                                      // STEREO LINK
      [config.config.value[0], 'color-'+config.config.value[2]],  // NAME
      config.insert.value[0]==='ON'?config.insert.value[2]:'',    // INSERT
    ]);
  });
}
function createMain(scn, classes) {
  let name = 'Main';
  let header = ['name', 'dyn', 'insert'];
  let numch = scn.version!='X-Air'?2:1;

  return createTable(classes, name, header, numch, (id)=>{
    let name = (['LR', 'M'])[id-1];
    let config = scn.version!='X-Air'?scn.main[(['st', 'm'])[id-1]]:scn.lr;
    return createTR(0, [
      name,                                                     // CHANNEL NUMBER
      config.dyn.value[0]==='ON',                               // COMPRESSOR
      config.insert.value[0]==='ON'?config.insert.value[2]:'',  // INSERT
    ]);
  });
}
function createFx(scn, classes) {
  let name = 'FX-1';
  let header = ['ch', 'link', 'name', 'device', 'src'];
  let numch = 8;

  return createTable(classes, name, header, numch, (id)=>{
    let ch = id.toString().padStart(2, '0');
    let name = 'FX'+Math.floor((id+1)/2)+(id%2?'L':'R');
    let rtnconfig = scn.fxrtn[ch];
    let fxconfig = scn.fx[Math.floor((id+1)/2)];
    let link = scn.config.fxlink.value[Math.floor((id-1)/2)];

    return createTR(ch, [
      name,                                                             // CHANNEL NUMBER
      [link==='ON', 'link'],                                            // STEREO LINK
      [rtnconfig.config.value[0], 'color-'+rtnconfig.config.value[2]],  // NAME
      fxconfig.value[0],                                                // TYPE
      fxconfig.source.value[(ch-1)%2],                                  // SRC
    ]);
  });
}
function createFxD(scn, classes) {
  let name = scn.version!='X-Air'?'FX-2':'FX';
  let header = ['ch', 'device', 'src'];
  let numch = 4;

  return createTable(classes, name, header, numch, (id)=>{
    id += scn.version!='X-Air'?4:0;
    let name = 'FX'+id;
    let fxconfig = scn.fx[id];

    return createTR(id, [
      name,               // CHANNEL NUMBER
      fxconfig.value[0],  // TYPE
      'INS',              // SRC
    ]);
  });
}

function plot(scn) {
  let dom = document.querySelector('#out');
  dom.innerHTML = '';

  if(scn.version!=='X-Air') {
    let header = document.querySelector('h1');
    header.innerText = scn.name;
    if(scn.header[2] !== "") {
      header.innerText = scn.name + " [" + scn.header[2] + "]"
    }

    let one = document.createElement('div');
    one.classList.add("row", "col", "s12", "m12", "l7");
    one.appendChild(createChannel(scn, ['col', 's12', 'm12', 'l12']));
    dom.appendChild(one);

    let two = document.createElement('div');
    two.classList.add("row", "col", "s12", "m12", "l5");
    two.appendChild(createBus(scn, ['col', 's12', 'm6', 'l12']));
    two.appendChild(createMatrix(scn, ['col', 's12', 'm6', 'l12']));
    dom.appendChild(two);

    let three = document.createElement('div');
    three.classList.add("row", "col", "s12", "m12", "l12");
    three.appendChild(createAux(scn, ['col', 's12', 'm6', 'l6']));
    three.appendChild(createMain(scn, ['col', 's12', 'm6', 'l6']));
    dom.appendChild(three);

    let four = document.createElement('div');
    four.classList.add("row", "col", "s12", "m12", "l12");
    four.appendChild(createFx(scn, ['col', 's12', 'm6', 'l6']));
    four.appendChild(createFxD(scn, ['col', 's12', 'm6', 'l6']));
    dom.appendChild(four);
  } else {
    let header = document.querySelector('h1');
    header.innerText = 'X-Air Scene';

    let one = document.createElement('div');
    one.classList.add("row", "col", "s12", "m12", "l7");
    one.appendChild(createChannel(scn, ['col', 's12', 'm12', 'l12']));
    dom.appendChild(one);

    let two = document.createElement('div');
    two.classList.add("row", "col", "s12", "m12", "l5");
    two.appendChild(createBus(scn, ['col', 's12', 'm6', 'l12']));
    two.appendChild(createFxD(scn, ['col', 's12', 'm6', 'l6']));
    two.appendChild(createMain(scn, ['col', 's12', 'm6', 'l6']));
    dom.appendChild(two);
  }
}

function convert2json(lines) {
  let scn = {};
  if(lines[0][0][0] !== '/') {
    let header = lines[0];
    lines = lines.slice(1);
    scn.version = header[0];
    scn.name = header[1];
    scn.header = header;
  } else {
    scn.version = 'X-Air';
    scn.name = 'Unnamed scene';
  }
  lines.forEach((e)=>{
    if (!e[0] || e[0].split('/').length === 0) return;
    let path = e[0].split('/');
    path = path.slice(1);
    let value = e.slice(1);
    let current = scn;
    // console.log("PATH:", path);
    path.forEach((p)=>{
      // console.log(p);
      let next = current[p] || {};
      current[p] = next;
      // console.log(current);
      current = next;
      // console.log(config);
    });
    current.value = value;
  });
  return scn;
}

document.querySelector('input[type=file]').addEventListener('change', function(evt) {
  let files = evt.target.files; // FileList object
  let reader = new FileReader();
  reader.onload = function(e) {
    let text = e.target.result;
    let lines = text.split('\n');
    let out = [];
    for (let line of lines) {
      let res = line.split('"'); // split lines on quotes
      res = res.map((e, i)=>{
        if (i%2) return e; // every uneven, previously quoted
        if (e.trim() !== '') return e.trim().split(' ').filter((e)=>e!==''); // unquoted
        return null; // return null for spaces between quotes
      });
      res = res.filter((e)=>e!==null); // filter null (spaces between quotes)
      res = [].concat(...res);
      out.push(res);
    }

    let scn = convert2json(out);

    console.log(scn);
    document.querySelector('pre').innerText = JSON.stringify(scn, null, 4);

    plot(scn);
  };
  reader.readAsText(files[0]);
}, false);
