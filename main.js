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
  })[short];
}

function getPhysicalIn(scn, id) {
  return id.toString().padStart(2, '0') + ' (' + getPhysicalName(scn, id) + ')';
}

function getPhysicalName(scn, id) {
  let IN = scn.config.routing.IN.value;
  if(id <= 36) {
    return IN[Math.floor((id-1)/8)] + ' [' + ((id-1)%8+1) + ']' ;
  }
  
  return ({
    37: 'USB-Player',
    38: 'USB-Player',
    39: 'Unknown',
    40: 'Unknown',
    41: 'Unknown',
    42: 'Unknown',
    43: 'Unknown',
    44: 'Unknown',
    45: 'Unknown',
    46: 'Unknown',
    47: 'Unknown',
    48: 'Unknown',
    49: 'BUS01',
    50: 'BUS02',
    51: 'BUS03',
    52: 'BUS04',
    53: 'BUS05',
    54: 'BUS06',
    55: 'BUS07',
    56: 'BUS08',
    57: 'BUS09',
    58: 'BUS10',
    59: 'BUS12',
    60: 'BUS13',
    61: 'BUS14',
    62: 'BUS15',
    63: 'BUS16',
    64: 'Unknown',
  })[id];
}

function createChannel(scn, classes) {
  let name = 'Channel';
  let header = ['ch', 'link', 'name', 'lowcut', 'gate', 'dyn', 'insert', 'physical'];
  let numch = 32;

  return createTable(classes, name, header, numch, (id)=>{
    let ch = id.toString().padStart(2, '0');
    let config = scn.ch[ch];
    let link = scn.config.chlink.value[Math.floor((id-1)/2)];
    return createTR(ch, [
      ch,                                                         // CHANNEL NUMBER
      [link==='ON', 'link'],                                      // STEREO LINK
      [config.config.value[0], 'color-'+config.config.value[2]],  // NAME
      config.preamp.value[2]==='ON',                              // LOWCUT
      config.gate.value[0]==='ON',                                // GATE
      config.dyn.value[0]==='ON',                                 // COMPRESSOR
      config.insert.value[0]==='ON'?config.insert.value[2]:'',    // INSERT
      getPhysicalIn(scn, config.config.value[3]),                 // PHYSICAL  
    ]);
  });
}
function createAux(scn, classes) {
  let name = 'Aux';
  let header = ['ch', 'link', 'name', 'physical'];
  let numch = 6;
  
  return createTable(classes, name, header, numch, (id)=>{
    let ch = id.toString().padStart(2, '0');
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
  let numch = 16;
  
  return createTable(classes, name, header, numch, (id)=>{
    let ch = id.toString().padStart(2, '0');
    let config = scn.bus[ch];
    let link = scn.config.buslink.value[Math.floor((id-1)/2)];
    return createTR(ch, [
      ch,                                                         // CHANNEL NUMBER
      [link==='ON', 'link'],                                      // STEREO LINK
      [config.config.value[0], 'color-'+config.config.value[2]],  // NAME
      config.dyn.value[0]==='ON',                                 // COMPRESSOR
      config.insert.value[0]==='ON'?config.insert.value[2]:'',    // INSERT
    ]);
  });
}
function createMatrix(scn, classes) {
  let name = 'Matrix';
  let header = ['ch', 'link', 'name', 'insert'];
  let numch = 6;
  
  return createTable(classes, name, header, numch, (id)=>{
    let ch = id.toString().padStart(2, '0');
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
  let numch = 2;

  return createTable(classes, name, header, numch, (id)=>{
    let name = (['LR', 'M'])[id-1]; 
    let config = scn.main[(['st', 'm'])[id-1]];
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
  let name = 'FX-2';
  let header = ['ch', 'device', 'src'];
  let numch = 4;
  
  return createTable(classes, name, header, numch, (id)=>{
    id += 4;
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
  let header = document.querySelector('h1');
  header.innerText = scn.name;
  
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
}

function convert2json(lines) {
  let header = lines[0];
  lines = lines.slice(1);
  let scn = {};
  scn.version = header[0];
  scn.name = header[1];
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
        if (e.trim() !== '') return e.trim().split(' '); // unquoted
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
