/*
 Map input strings as if they were touch typed on a Dvorak keyboard.
 Filter out uncommon characters.
 Upper-case first alphabetic character.

 Note: Mapping from Windows 11 US to Windows 11 US Dvorak mapping
 English (United States); US QWERTY; United States-Dvorak DVORAK
 */

/*
TODO:
- support variants (i.e. for allowed chars)
- support iterations/ versions (i.e. increment num)
- Argon2 https://github.com/antelle/argon2-browser
	(argon2id, min, Memory: 7 MiB, Iterations: 5, Parallelism: 1)
	salt ideally 16 bytes
	check against alternative implementation (i.e. python)
 */

const us = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-=[];'\\,./~_+{}:"||<>?`;
const dv = `axje.uidchtnmbrl'poygk,qf;AXJE>UIDCHTNMBRL"POYGK<QF:[]/=s-\\wvz~{}?+S_||WVZ`;
const alphaNum = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"

// Windows English (United States) keyboard shifted one key to the right
const shifted = `snvfrghjokl;,mp[wtdyibecuxSNVFRGHJOKL:<MP{WTDYIBECUX`

// pwManager or mostCommon makes little difference,
//   since chars mapped to dvorak from qwerty alphanum are mostly outside both
//   .',;>"<:
const pwManager = "!@*$&%^# ";  // lastpass, bitwarden, nordpass, ~dashlane
const mostCommon = "_.-!@*$?&%=^+# ";
const allowedChars = alphaNum + pwManager;
const allowed = new Map(
	allowedChars.split("").map(x => [x, x])
);


let mappingDvorak = new Map(us.split("").map(
	(elt, idx) => [elt, dv[idx]])
);

let mappingShifted = new Map(us.split("").map(
	(elt, idx) => [elt, shifted[idx]])
);


// map characters to dvorak, or to itself if not found
function lookupDvorak(c) {
	let x = mappingDvorak.get(c);
	if (x === undefined) {
		return c;
	} else {
		return x;
	}
}


function lookupShifted(c) {
	let x = mappingShifted.get(c);
	if (x === undefined) {
		return c;
	} else {
		return x;
	}
}


/* remove unsuitable characters */
function clean(string) {
	return string.split("").map(x => allowed.get(x)).join("");
}


/* convert input to dvorak/ shifted */
function convert(string, doClean=true, doUpper=true) {
	res = string.split("").map(elt => lookupShifted(elt)).join("");
	if (doClean) {
		res = clean(res)
	}
	if (doUpper) {
		matches = res.match(/[a-zA-Z]/);
		if (matches) {
			res = res.replace(matches[0], matches[0].toUpperCase());
		}
	}
	return res;
}

function digit_convert(character) {
	return String(9 - Number(character));
}

function num_convert(string) {
	res = string.split("").map(digit_convert).join("");
	return res;
}


// https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
// also see: https://gist.github.com/feeedback/e6d137d3f54b1aa0310d690daadfaf28
function hashCode(s) {
    for(var i = 0, h = 0; i < s.length; i++)
        h = Math.imul(31, h) + s.charCodeAt(i) | 0;

    return h >>> 0;
}

// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript/52171480#52171480
const cyrb53 = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};


// https://rot47.net/_js/convert.js
function convertBase(src, srctable, desttable)
{
	var srclen = srctable.length;
	var destlen = desttable.length;
	// first convert to base 10
	var val = 0;
	var numlen = src.length;
	for (var i = 0; i < numlen; i ++)
	{
		val = val * srclen + srctable.indexOf(src.charAt(i));
	}
	if (val < 0)
	{
		return 0;
	}
	// then covert to any base
	var r = val % destlen;
	var res = desttable.charAt(r);
	var q = Math.floor(val / destlen);
	while (q)
	{
		r = q % destlen;
		q = Math.floor(q / destlen);
		res = desttable.charAt(r) + res;
	}
	return res;
}

// if under node
if (typeof process !== 'undefined') {
	let inp = process.argv[2];
	let hashed = cyrb53(inp);
	let conv = convertBase(hashed.toString(), "0123456789", allowedChars);
	console.log(input, hashed, conv);


	let lorem_us = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
	let lorem_dv = "Nrp.m clogm ernrp ocy am.yw jrbo.jy.ygp aeclcojcbi .ncyw o.e er .cgomre y.mlrp cbjcecegby gy naxrp. .y ernrp. maiba anc'gav"

	let lorem = convert(lorem_us, false);
	console.assert(lorem === lorem_dv, "lorem_us");

	let chars_us = `qwzEQWZ`;
	let chars_dv = `',;>"<:`;

	let chars = convert(chars_us, false);
	console.assert(chars === chars_dv, "chars_us", [chars, chars_dv]);

	let input = process.argv[2];
	console.log(convert(input, true));
}
