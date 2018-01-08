import test from 'ava';
import GraphToFlow from '../parser/graph-to-flow';

test(t => {
  const lang = `
  st=>start: start
  dcs1=>condition: QasiCksHknCz
  st1=>operation: dSmJIPimnr
  st2=>operation: Vutyv
  dcs3=>condition: cHlNBIVZaE
  st4=>operation: rcjLayGSMU
  end=>end: end
  st(right)->dcs1
  dcs1(yes, bottom)->st1
  dcs3(no)->dcs1
  st4(left)->dcs1
  `;

  const expected =
`st=>start: start|blank
dcs1=>condition: QasiCksHknCz|blank
st1=>operation: dSmJIPimnr|blank
st2=>operation: Vutyv|blank
dcs3=>condition: cHlNBIVZaE|blank
st4=>operation: rcjLayGSMU|blank
end=>end: end|blank
st(right)->dcs1
dcs1(yes, bottom)->st1
dcs3(no)->dcs1
st4(left)->dcs1`;

  t.is(GraphToFlow.cleanLabel(lang), expected);
})