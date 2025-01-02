function setShaderToy() {
  const ids = ["ld3Gz2", "4ttSWf", "XslGRr", "MdX3Rr", "XsX3RB", "WsSBzh"];
  let id = ids[parseInt(Math.random() * ids.length)];
  ifrm_shadertoy.src = `https://www.shadertoy.com/embed/${id}?gui=true&paused=false&muted=false`;
}
