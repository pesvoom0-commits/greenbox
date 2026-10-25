import test from 'node:test';
import assert from 'node:assert/strict';
import { filterItems, colorCodes, httpsUrl } from '../assets/model.js';
const items = [{name:'ミント',category:'自然',colorGroup:'mint',description:'葉の形',colorHex:'#00FF00'}, {name:'機器',category:'人工物',colorGroup:'lime',sourceUrl:'https://example.org/source',material:'ABS',colorHex:'#C2FF40'}];
test('無条件・無効な軸は全件、指定した条件はOR', () => {
 assert.equal(filterItems(items).length,2);
 assert.deepEqual(filterItems(items,{query:'葉',category:'人工物',color:'mint'}),items);
 assert.deepEqual(filterItems(items,{query:'abs'}),[items[1]]);
 assert.deepEqual(filterItems(items,{query:'みんと'}),[items[0]]);
 assert.deepEqual(filterItems(items,{query:'ＥＸＡＭＰＬＥ'}),[items[1]]);
 assert.equal(filterItems(items,{query:'不一致'}).length,0);
 assert.deepEqual(filterItems(items,{color:'lime'}),[items[1]]);
});
test('色はHEXから一貫して換算し黒の除算も扱う', () => {
 assert.deepEqual(colorCodes('#00ff00'),{hex:'#00FF00',rgb:'0, 255, 0',cmyk:'100%, 0%, 100%, 0%'});
 assert.equal(colorCodes('#000000').cmyk,'0%, 0%, 0%, 100%');
 assert.equal(colorCodes('red'),null);
});
test('外部リンクはHTTPSのみ許可', () => {
 assert.equal(httpsUrl('javascript:alert(1)'),null);
 assert.equal(httpsUrl('https://example.org/a'),'https://example.org/a');
});
