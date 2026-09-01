const fs = require('fs');
const path = require('path');
const vm = require('vm');

const markerDir = path.join(__dirname, '..', 'GTA-SA-MapInteractivo', 'marker');
const outDir = path.join(__dirname, '..', 'src', 'app', 'data');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const markerFiles = fs.readdirSync(markerDir).filter(f => f.endsWith('.js'));

markerFiles.forEach(file => {
  const filePath = path.join(markerDir, file);
  const code = fs.readFileSync(filePath, 'utf8');
  
  const context = {};
  vm.createContext(context);
  try {
    vm.runInContext(code, context);
  } catch (err) {
    console.error(`Error evaluating ${file}:`, err);
    return;
  }

  const baseName = path.basename(file, '.js');

  if (baseName === 'race_tournaments') {
    const data = {
      los_santos_races: context.los_santos_races,
      san_fierro_races: context.san_fierro_races,
      las_venturas_races: context.las_venturas_races,
      air_races: context.air_races
    };
    fs.writeFileSync(path.join(outDir, `${baseName}.json`), JSON.stringify(data, null, 2));
    console.log(`Saved race_tournaments.json`);
  } else {
    const keys = Object.keys(context);
    if (keys.length === 1) {
      const data = context[keys[0]];
      fs.writeFileSync(path.join(outDir, `${baseName}.json`), JSON.stringify(data, null, 2));
      console.log(`Saved ${baseName}.json`);
    } else {
      console.log(`Multiple or no keys in ${file}:`, keys);
      fs.writeFileSync(path.join(outDir, `${baseName}.json`), JSON.stringify(context, null, 2));
    }
  }
});

console.log('Finished converting marker data.');
