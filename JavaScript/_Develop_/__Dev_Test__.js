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
    log: msg=> console.log(msg),
    warn: msg=> console.warn(msg),
    table: msg=> console.table(msg),
    trace: msg=> console.trace(msg),
    error: msg=> console.error(msg),
    count: msg=> console.count(msg),
};

async function Log(group=null, msg="print", {
    dev=true,
    type="log",
    each=false,
    collapsed=true
}={}) {
    if (!dev) return;

    let PrintCall, Cache;
    if (each) {
        PrintCall = {
            Array: (msg)=> {
                for (Cache of msg) {
                    
                }
            },
            Object: (msg)=> {
                
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
let test1 = {"object1": "物件1", "object2": "物件2", "object3": "物件3"};
"Array"
"Object"

//Log("測試", Object.entries(test1));

const Teststr = ""

Teststr.replace(/[\p{L}]+(?:[^()\[\]{}\t])+[\p{L}]\.*/gu, t => {
    console.log(t);
})