const user = [
    {
        name: "aaa",
        age: 10,
    },
    {
        name: "bbb",
        age: 20,
    },
    {
        name: "ccc",
        age: 30,
    }
];

const Type = (object) => Object.prototype.toString.call(object).slice(8, -1);

const Print = { // Log()
    log: msg => console.log(msg),
    warn: msg => console.warn(msg),
    table: msg => console.table(msg),
    trace: msg => console.trace(msg),
    error: msg => console.error(msg),
    count: msg => console.count(msg),
};

async function Log(group = null, msg = "print", {
    dev = true,
    type = "log",
    each = false,
    collapsed = true
} = {}) {
    if (!dev) return;

    let PrintCall, Cache;
    if (each) {
        PrintCall = {
            Array: (msg) => {
                for (Cache of msg) {

                }
            },
            Object: (msg) => {

            },
        };
    } else PrintCall = Print;

    if (group == null) {
        Call(msg);
    } else {
        collapsed ? console.groupCollapsed(group) : console.group(group);
        for (let l of msg) Call(l);
        console.groupEnd();
    }
}

//Log(null, {"頭": document.head, "身體": document.body, "全": document.documentElement});

let test = ["list1", "list2", "list3"];
let test1 = { "object1": "物件1", "object2": "物件2", "object3": "物件3" };
"Array"
"Object"

function Translation(text) {
    if (text.length == 0) return;

    text.replace(/[\d\p{L}]+(?:[^()\[\]{}{[(\t\n])+[\d\p{L}]\.*/gu, t => {
        console.log(`"${t.trim()}"`);
    })
}

Translation("");

// Todo: 修改排序, 並再最上方添加, 所有 Index 對象
const data = new Map([
    [
        1469,
        "https://ymgqrpn.uvcdsnfqehdr.hath.network:9999/h/767d06e0f551490a1bcd72b829ba2e39ed5d8be8-166395-1024-1376-jpg/keystamp=1726433700-5fac8fb5da;fileindex=149728314;xres=2400/118329563_p4.jpg"
    ],
    [
        1593,
        "https://ymgqrpn.uvcdsnfqehdr.hath.network:9999/h/43294c34dc7dcb63b4ddf1223f6733a9a278cf9b-100732-1024-1376-jpg/keystamp=1726433700-0fc79fd293;fileindex=149674501;xres=2400/118488981_p12.jpg"
    ],
    [
        1977,
        "https://ymgqrpn.uvcdsnfqehdr.hath.network:9999/h/94ea40df81f19d1e1ef6ecb4dd970eee1cc05b47-121525-1024-1376-jpg/keystamp=1726433700-49bee3d06f;fileindex=149728469;xres=2400/118953676_p4.jpg"
    ],
    [
        1518,
        "https://ojqupia.peqvjdkvteau.hath.network:6789/h/8ea1dfe85bca00d0e25e42b412966853281e5d45-133009-1024-1376-jpg/keystamp=1726433700-3e66aaf5f4;fileindex=149728431;xres=2400/118423257_p11.jpg"
    ],
    [
        1872,
        "https://ojqupia.peqvjdkvteau.hath.network:6789/h/7bb79edc43d6a3205841a4969bf109543377d712-115651-1024-1376-jpg/keystamp=1726433700-a3ec7c5deb;fileindex=149674881;xres=2400/118803929_p1.jpg"
    ],
    [
        681,
        "https://ojqupia.peqvjdkvteau.hath.network:6789/h/1ff4c0cf52d41322bd1c1ec90e94d9e6a13724ef-109726-1024-1376-jpg/keystamp=1726433700-5ab1efcafb;fileindex=151241281;xres=2400/119280514_p11.jpg"
    ],
    [
        1266,
        "https://ojqupia.peqvjdkvteau.hath.network:6789/h/0e21f89f5fb5eb9fe638cd42ec3ad23326d31023-123138-1024-1376-jpg/keystamp=1726433700-5377b9e09f;fileindex=149727748;xres=2400/117978300_p3.jpg"
    ],
    [
        1942,
        "https://lsoqzsb.kbwwdhyinbxp.hath.network:2333/h/7a51703e08a1ea3acefcb9968782683b20ec6125-149082-1024-1376-jpg/keystamp=1726433700-1831a66553;fileindex=149674976;xres=2400/118898710_p5.jpg"
    ],
    [
        1091,
        "https://ymgqrpn.uvcdsnfqehdr.hath.network:9999/h/5569fe273fa6127f2a5bb821262ee9dfe00ea973-117240-1024-1376-jpg/keystamp=1726433700-f86d008ff0;fileindex=150138371;xres=2400/119070638_p2.jpg"
    ],
    [
        1096,
        "https://ymgqrpn.uvcdsnfqehdr.hath.network:9999/h/c2b5c9d8445966003db67bc5a5d6eac163b85882-126642-1024-1376-jpg/keystamp=1726433700-3849ea3264;fileindex=150138376;xres=2400/119070638_p7.jpg"
    ],
    [
        1955,
        "https://urynwsx.kbwwdhyinbxp.hath.network:2333/h/322cdfcabeb83a1458348c0df4f5545a81442e36-128312-1264-1136-jpg/keystamp=1726433700-5dc85ffd6f;fileindex=149674997;xres=2400/118926156_p6.jpg"
    ],
    [
        1958,
        "https://uxnfbog.kbwwdhyinbxp.hath.network:2333/h/849ce32f031e8ae5b6173038dadd2d18dadb357f-120424-1264-1136-jpg/keystamp=1726433700-1e55228eff;fileindex=149675000;xres=2400/118926156_p9.jpg"
    ],
    [
        1966,
        "https://urynwsx.kbwwdhyinbxp.hath.network:2333/h/aadad99153febc5e8c37790fac62c9eb89436629-130171-1264-1136-jpg/keystamp=1726433700-24af77647e;fileindex=149674992;xres=2400/118926156_p17.jpg"
    ],
    [
        1652,
        "https://uxauyne.jdsjhckyslwu.hath.network:25780/h/b766c5f6ad3696a8059f193475fa46534b53a49f-131205-1024-1376-jpg/keystamp=1726433700-09283c2b30;fileindex=149674614;xres=2400/118575648_p9.jpg"
    ],
    [
        1978,
        "https://lsoqzsb.kbwwdhyinbxp.hath.network:2333/h/a7b6053e5d3b8e4fef7267f870c02ae7a1e31b74-115146-1024-1376-jpg/keystamp=1726433700-f4573b264a;fileindex=149728470;xres=2400/118953676_p5.jpg"
    ],
    [
        1982,
        "https://upbinxx.kbwwdhyinbxp.hath.network:2333/h/289880d7a811ff899532ec4abd2ef268f6c1cb62-127940-1024-1376-jpg/keystamp=1726433700-ca1f145202;fileindex=149728481;xres=2400/118954020_p3.jpg"
    ],
    [
        1147,
        "https://uxauyne.jdsjhckyslwu.hath.network:25780/h/a2dbed67ad1c8ad3381f60432c136465586deb86-122417-1280-1011-jpg/keystamp=1726433700-9cd61c9f64;fileindex=149727586;xres=1280/117628209_p5.jpg"
    ],
    [
        1979,
        "https://lsymvfm.rbftdensabnp.hath.network:22333/h/9588672902b4fa4960ce041be6a1a979b6ad7fe0-157177-1024-1376-jpg/keystamp=1726433700-b1baf1a4b8;fileindex=149728471;xres=2400/118954020_p0.jpg"
    ],
    [
        1971,
        "https://chpiyia.tlponccxgtkp.hath.network:39980/h/52ed758887307e501dd28e12cf3a11a8f0ac13dd-129323-1024-1376-jpg/keystamp=1726433700-dd1c368291;fileindex=149675005;xres=2400/118926353_p4.jpg"
    ],
    [
        1968,
        "https://uxlbesv.nbkwlaaleaeb.hath.network/h/f73f645a603d6c08b47c118a458e72411cedc52f-125667-1024-1376-jpg/keystamp=1726433700-947553bd91;fileindex=149675002;xres=2400/118926353_p1.jpg"
    ],
    [
        1529,
        "https://uxauyne.jdsjhckyslwu.hath.network:25780/h/a2db5f64e925ece3f9b24216f194a54ded18c608-118244-1024-1376-jpg/keystamp=1726433700-cc538c994f;fileindex=149674378;xres=2400/118423904_p2.jpg"
    ],
    [
        1970,
        "https://qxanqop.ugbjgxcvlgao.hath.network:10443/h/76d5d71972359c9c56b01acf1466bf13087cd1bf-133866-1024-1376-jpg/keystamp=1726433700-dc70149e57;fileindex=149675004;xres=2400/118926353_p3.jpg"
    ],
    [
        1975,
        "https://pwjpefd.dqkbsfpkktje.hath.network/h/9cb3667105192c119b0478107640654b2b971a04-128396-1024-1376-jpg/keystamp=1726433700-05b08ec5d6;fileindex=149728466;xres=2400/118953676_p2.jpg"
    ],
    [
        1976,
        "https://zffhpco.lhkzlcnkbynm.hath.network:25500/h/c498c11df503d52923552231ef5aa97cdd0f2fe0-121398-1024-1376-jpg/keystamp=1726433700-9247bc425d;fileindex=149728467;xres=2400/118953676_p3.jpg"
    ],
    [
        1984,
        "https://ichetke.jhmoadqmflsy.hath.network/h/48a6aebaaa0c8c9ba0b225a4f98cc19faf6b12ce-107828-1024-1376-jpg/keystamp=1726433700-ae430f2c8d;fileindex=149728483;xres=2400/118954020_p5.jpg"
    ],
    [
        1916,
        "https://vjdbjte.wiaprhlncfhp.hath.network:39527/h/763411af602dc6db19adf061bc54719a0032fe1c-159615-1024-1376-jpg/keystamp=1726433700-3714dd77a4;fileindex=149674942;xres=2400/118866228_p11.jpg"
    ],
    [
        1987,
        "https://xebdoag.jaonvkmhjjgp.hath.network:20526/h/9c9476619aff7d8f7f0f2ffff1f44d1cfcb000b1-120509-1024-1376-jpg/keystamp=1726433700-e963814a5f;fileindex=149728486;xres=2400/118954020_p8.jpg"
    ],
    [
        1963,
        "https://cujhltj.gijcrijspthq.hath.network/h/e63bbffcd883561162824fff9ec86fe2df8e1c3d-119769-1264-1136-jpg/keystamp=1726433700-2884315f54;fileindex=149674989;xres=2400/118926156_p14.jpg"
    ],
    [
        1960,
        "https://vemkuxp.afuvdllqscgw.hath.network/h/5d5596515ac18ebde7fdb650471abb5f25aa73b1-129339-1264-1136-jpg/keystamp=1726433700-80533f61aa;fileindex=149674986;xres=2400/118926156_p11.jpg"
    ],
    [
        1961,
        "https://hcrbwzr.fwbcyosfvzij.hath.network/h/0a7c9ac57687e9da05ab3fe1b76f190005cede49-129895-1264-1136-jpg/keystamp=1726433700-afc78f2bde;fileindex=149674987;xres=2400/118926156_p12.jpg"
    ],
    [
        1986,
        "https://rtsapju.effogwfvzsxf.hath.network:3818/h/df221b50ef010d50d36691a5c0382cf0adfb9bcb-113012-1024-1376-jpg/keystamp=1726433700-fd71803381;fileindex=149728485;xres=2400/118954020_p7.jpg"
    ],
    [
        1990,
        "https://ydbdncz.kbwwdhyinbxp.hath.network:2333/h/e37c755eb4676b8f1da4d8dc08c99849a1c1d2d5-113152-1024-1376-jpg/keystamp=1726433700-c03c70dcde;fileindex=149728474;xres=2400/118954020_p11.jpg"
    ],
    [
        1980,
        "https://efmuluj.kbwwdhyinbxp.hath.network:2333/h/805f71cefa9b17aa97fada9bb63cc1c88b6558ec-130791-1024-1376-jpg/keystamp=1726433700-5dc3a0ba0e;fileindex=149728472;xres=2400/118954020_p1.jpg"
    ],
    [
        1991,
        "https://upbinxx.kbwwdhyinbxp.hath.network:2333/h/a231c7ecd8f4dfd089ac2d59c2e511b10a73f471-130438-1024-1376-jpg/keystamp=1726433700-f65e8c58be;fileindex=149728475;xres=2400/118954020_p12.jpg"
    ],
    [
        1973,
        "https://efmuluj.kbwwdhyinbxp.hath.network:2333/h/65c84ce6c6fdc7307fdee3cc66c2a013a64c3d06-126486-1024-1376-jpg/keystamp=1726433700-dc0650eb48;fileindex=149728464;xres=2400/118953676_p0.jpg"
    ],
    [
        1954,
        "https://ymatuqh.whxnzprurfhg.hath.network:11443/h/7802965dad8cba85dc8705d0678ed300a3356a26-138363-1264-1136-jpg/keystamp=1726433700-5b7df22b1c;fileindex=149674996;xres=2400/118926156_p5.jpg"
    ],
    [
        1940,
        "https://yfpvlhf.mnogomslbdgo.hath.network:45123/h/1807fa52ae69f1a7dbcba781ff7cb0fe70dba3b5-134032-1024-1376-jpg/keystamp=1726433700-b564710852;fileindex=149674974;xres=2400/118898710_p3.jpg"
    ],
    [
        1947,
        "https://cqdzlpr.ralkookyklxk.hath.network/h/a50f918e131bf2dd598b2f3b8361b993d82f209d-152991-1024-1376-jpg/keystamp=1726433700-2bb973035b;fileindex=149674981;xres=2400/118898881_p3.jpg"
    ],
    [
        1989,
        "https://qfigsdy.zvjacqusqbpl.hath.network:25000/h/f349401eee664ee79746a4b1629a4cc2b3b2b7b7-109805-1024-1376-jpg/keystamp=1726433700-c037ff81a8;fileindex=149728473;xres=2400/118954020_p10.jpg"
    ],
    [
        1956,
        "https://enuaegf.eucythndcmnn.hath.network:34680/h/e51b934a4269dd9f8725f2e62eb7771bfe597d3a-108341-1264-1136-jpg/keystamp=1726433700-be70d30543;fileindex=149674998;xres=2400/118926156_p7.jpg"
    ],
    [
        1962,
        "https://xtoxgkz.mjrxenmvhzdt.hath.network/h/9bb6bd938739dda92c52392f99496b8de5459942-127690-1264-1136-jpg/keystamp=1726433700-bfd54846d0;fileindex=149674988;xres=2400/118926156_p13.jpg"
    ],
    [
        1950,
        "https://pmconix.sthxzfvpjvva.hath.network:5147/h/86f4b22b8d0fb30a36751d06811fddb97e8e678b-150822-1024-1376-jpg/keystamp=1726433700-8fb2671582;fileindex=149674984;xres=2400/118926156_p1.jpg"
    ],
    [
        1957,
        "https://riexynn.egbplpilwepp.hath.network/h/c7effaedbfa95a9b1b710e721a2c41acfd14fe6f-121518-1264-1136-jpg/keystamp=1726433700-e4d737815d;fileindex=149674999;xres=2400/118926156_p8.jpg"
    ],
    [
        1953,
        "https://coqaqop.lkdydhbyhuzo.hath.network:9000/h/e53fbcd6f2c80ff5e28d9152b0860afb99a830fd-109297-1024-1376-jpg/keystamp=1726433700-597094e61b;fileindex=149674995;xres=2400/118926156_p4.jpg"
    ],
    [
        1965,
        "https://yujxrsz.dqkbsfpkktje.hath.network/h/53b1ac61245f6d01d37316a62fd4127a0a9656c9-128269-1264-1136-jpg/keystamp=1726433700-ac993a37a1;fileindex=149674991;xres=2400/118926156_p16.jpg"
    ],
    [
        1969,
        "https://twtgbll.zswisockiwsw.hath.network:8787/h/6bd55a33ae982a302459e71ec7f20fa18398e69e-121522-1024-1376-jpg/keystamp=1726433700-730ca709f9;fileindex=149675003;xres=2400/118926353_p2.jpg"
    ],
    [
        1952,
        "https://irrgtag.wononjiinobh.hath.network:52200/h/37a3ca8a89f91f34574eefaef8d39931e8a0768f-123516-1024-1376-jpg/keystamp=1726433700-e743d8e450;fileindex=149674994;xres=2400/118926156_p3.jpg"
    ],
    [
        1951,
        "https://mknjmgy.mkcdopiwqrzb.hath.network:54200/h/c92a4a4630f46fe0c646981de8ed3d989406fdc5-166808-1024-1376-jpg/keystamp=1726433700-1d13c644e6;fileindex=149674993;xres=2400/118926156_p2.jpg"
    ],
    [
        1946,
        "https://vzsrqla.xpalnxlfijly.hath.network/h/6f6813bb04128115e7b88e352349462f3a27dd82-154004-1024-1376-jpg/keystamp=1726433700-08718335c0;fileindex=149674980;xres=2400/118898881_p2.jpg"
    ],
    [
        1948,
        "https://mmbsxox.ycomatbnfqcg.hath.network:2053/h/7986797cd582767d2030c93bfe8d49605851e45c-170123-1024-1376-jpg/keystamp=1726433700-4bcca8a79b;fileindex=149674982;xres=2400/118898881_p4.jpg"
    ],
    [
        1918,
        "https://wualxbn.ruhozcnjrkel.hath.network:59528/h/f61c1f3e0b0f25cd113e8f117e4a2f57e2126473-151278-1024-1376-jpg/keystamp=1726433700-d794639308;fileindex=149674944;xres=2400/118866228_p13.jpg"
    ],
    [
        1941,
        "https://kkxhyqp.lsfzaxeowyqj.hath.network:19467/h/abbfc7118e87f1a0844f1743c92652fbc1b598f3-151472-1024-1376-jpg/keystamp=1726433700-699bfe0292;fileindex=149674975;xres=2400/118898710_p4.jpg"
    ],
    [
        1994,
        "https://aqpzdmn.unvupejtfoln.hath.network:9527/h/bbf1913992b72e5e13c8dd5a6f0e104247268e01-109452-1024-1376-jpg/keystamp=1726433700-f4dc4949a6;fileindex=149728478;xres=2400/118954020_p15.jpg"
    ],
    [
        1972,
        "https://vemkuxp.afuvdllqscgw.hath.network/h/102617a06c05a59bd8b642483ac8132a468f8ef5-142413-1024-1376-jpg/keystamp=1726433700-7af63b1d31;fileindex=149675006;xres=2400/118926353_p5.jpg"
    ],
    [
        1985,
        "https://vcapsib.joaursxznrvw.hath.network:19999/h/362bed655410dbaac4b56675d78307c50e43d3f3-121162-1024-1376-jpg/keystamp=1726433700-c84f1aa1ff;fileindex=149728484;xres=2400/118954020_p6.jpg"
    ],
    [
        1995,
        "https://kkxhyqp.lsfzaxeowyqj.hath.network:19467/h/901efe6e64bf3878d2835ac9a6a871b8d0b35bc1-118092-1024-1376-jpg/keystamp=1726433700-b44e02aa46;fileindex=149728479;xres=2400/118954020_p16.jpg"
    ],
    [
        1967,
        "https://vgbqkwa.pvadqvyhicbe.hath.network:8765/h/00d96898c37bc64b35c6c78258a2b8d3c7908542-128201-1024-1376-jpg/keystamp=1726433700-48caa6c90d;fileindex=149675001;xres=2400/118926353_p0.jpg"
    ],
    [
        1992,
        "https://xtoxgkz.mjrxenmvhzdt.hath.network/h/12534bc2f0367b96be7e456ee07610f6fb7529db-115955-1024-1376-jpg/keystamp=1726433700-9a12e589cb;fileindex=149728476;xres=2400/118954020_p13.jpg"
    ],
    [
        1993,
        "https://djqafcf.aqbbghavspah.hath.network/h/9a967ce86808f111ca0cb050d606f70d4b27f9f0-124171-1024-1376-jpg/keystamp=1726433700-0268008208;fileindex=149728477;xres=2400/118954020_p14.jpg"
    ],
    [
        1959,
        "https://jircilm.uxjiejvgzrvh.hath.network:61462/h/6e92990f41a2236e2f463a5ca8f1c865c5e6223d-128708-1264-1136-jpg/keystamp=1726433700-e441166ef4;fileindex=149674985;xres=2400/118926156_p10.jpg"
    ],
    [
        1945,
        "https://kkxhyqp.lsfzaxeowyqj.hath.network:19467/h/75ea34551720b17344690d1b409e87052fd2dd5a-159197-1024-1376-jpg/keystamp=1726433700-8951072176;fileindex=149674979;xres=2400/118898881_p1.jpg"
    ],
    [
        1964,
        "https://rzioayp.nyrnfcbkdyxk.hath.network:1028/h/056c4e3b16bcd2b19ba0d67aa7140ef93c71aa8c-124613-1264-1136-jpg/keystamp=1726433700-66a454780f;fileindex=149674990;xres=2400/118926156_p15.jpg"
    ],
    [
        1974,
        "https://pwjpefd.dqkbsfpkktje.hath.network/h/ab27deb413a4c665acffea66bd825b33b1729f26-111754-1024-1376-jpg/keystamp=1726433700-c3af0d2014;fileindex=149728465;xres=2400/118953676_p1.jpg"
    ],
    [
        1983,
        "https://gypddvc.cejwjhpginst.hath.network:6504/h/a7ae2df97fbdb5b4b2be3645201b24e4efd207f4-119870-1024-1376-jpg/keystamp=1726433700-b8eed8fb76;fileindex=149728482;xres=2400/118954020_p4.jpg"
    ],
    [
        1988,
        "https://vemkuxp.afuvdllqscgw.hath.network/h/da9000a849282f4da9e48d913cbf11588e93e5b0-103348-1024-1376-jpg/keystamp=1726433700-960ccc9310;fileindex=149728487;xres=2400/118954020_p9.jpg"
    ],
    [
        1917,
        "https://vjdbjte.wiaprhlncfhp.hath.network:39527/h/379479059cd22cf9c9bf1780d4d63daceec17d1f-154361-1024-1376-jpg/keystamp=1726433700-00f229fa90;fileindex=149674943;xres=2400/118866228_p12.jpg"
    ]
])