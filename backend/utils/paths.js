export function getVeganPaths(allPaths) {
  let pathsByName = {};
  allPaths.map((path) => {
    pathsByName[path.name.toLowerCase().trim()] = path;
  });
  let veganPaths = [];
  allPaths.map((path) => {
    // remove paths for menstruation
    if (path.name.toLowerCase().includes('menstruation')) return;
    // add path if vegan variation on path OR if vegan variation on path does not exist
    if (!pathsByName[`${path.name.toLowerCase().trim()} for vegans`]) {
      veganPaths.push(path.id);
    }
  });
  return veganPaths;
}

export function getMenstruationPaths(allPaths) {
  let pathsByName = {};
  allPaths.map((path) => {
    pathsByName[path.name.toLowerCase().trim()] = path;
  });
  let menstruationPaths = [];
  allPaths.map((path) => {
    // remove paths for vegans
    if (path.name.toLowerCase().includes('vegan')) return;
    // add path if menstruation variation on path OR if menstruation variation on path does not exist
    if (!pathsByName[`${path.name.toLowerCase().trim()} for menstruation`]) {
      menstruationPaths.push(path.id);
    }
  });
  return menstruationPaths;
}

export function getDefaultPaths(allPaths) {
  let defaultPaths = [];
  allPaths.map((path) => {
    // add path if name is one word (default path)
    if (path.name.trim().split(' ').length === 1) {
      defaultPaths.push(path.id);
    }
  });
  return defaultPaths;
}
