function pasteInfo(data, type) {
    let allInfo
    console.log(data);
    console.log(`Data type is ${type}`);
    try {
        allInfo = JSON.parse(data);
    } catch (error) {
        console.log(error);
    }
    console.log(allInfo);
    // Company Info input
    if (type == "compInfo") {
        document.querySelector("#company > table > tbody > tr:nth-child(3) > td:nth-child(2) > input[type=text]").value = allInfo.compInfo.company;
        document.querySelector("#company > table > tbody > tr:nth-child(4) > td:nth-child(2) > input:nth-child(1)").value = allInfo.compInfo.phone;
        document.querySelector("#saddress1").value = allInfo.compInfo.street;
        document.querySelector("#saddress2").value = allInfo.compInfo.suite;
        document.querySelector("#scity").value = allInfo.compInfo.city;
        document.querySelector("#sstate").value = allInfo.compInfo.state;
        document.querySelector("#szip").value = allInfo.compInfo.zip;
    }
    // Contact Info input
    if (type == "conInfo") {
        document.querySelector("#contact > table > tbody > tr:nth-child(3) > td:nth-child(2) > input[type=text]").value = allInfo.conInfo.fname;
        document.querySelector("#contact > table > tbody > tr:nth-child(4) > td:nth-child(2) > input[type=text]").value = allInfo.conInfo.lname;
        document.querySelector("#contact > table > tbody > tr:nth-child(6) > td:nth-child(2) > input:nth-child(1)").value = allInfo.conInfo.phone;
        document.querySelector("#contact > table > tbody > tr:nth-child(9) > td:nth-child(2) > input[type=text]").value = allInfo.conInfo.email;
    }
    // Site Conditions input
    if (type == "sitInfo") {
        document.querySelector("#siteconditions > table > tbody > tr:nth-child(1) > td:nth-child(3) > label:nth-child(1) > input[type=checkbox]").checked = allInfo.sitInfo.coi;
        document.querySelector("#siteconditions > table > tbody > tr:nth-child(1) > td:nth-child(3) > label:nth-child(11) > input[type=checkbox]").checked = allInfo.sitInfo.dock;
        document.querySelector("#siteconditions > table > tbody > tr:nth-child(1) > td:nth-child(2) > label:nth-child(9) > input[type=checkbox]").checked = allInfo.sitInfo.elevator;
        document.querySelector("#siteconditions > table > tbody > tr:nth-child(1) > td:nth-child(3) > label:nth-child(15) > input[type=text]").value = allInfo.sitInfo.stairs;
    }
    // Project Details input
    if (type == "projDet") {
        try {
            console.log(`Changing ESD to ${allInfo.projDet.esd}`);
            document.getElementsByClassName("datepicker")[0].value = allInfo.projDet.esd;
            console.log(`Changing RDI checkbox to ${allInfo.projDet.rdi}`);
            document.querySelector("#type_1").checked = allInfo.projDet.rdi;
            document.querySelector("#type_4").checked = allInfo.projDet.roc;
            document.querySelector("#type_3").checked = allInfo.projDet.ins;
            document.querySelector("#detail_17").checked = allInfo.projDet.afterhrs;
            document.querySelector("#detail_1").checked = allInfo.projDet.afterhrs;
            document.querySelector("#detail_2").checked = allInfo.projDet.exclusive;
            document.querySelector("#cke_1_contents > iframe").contentDocument.querySelector("body").innerHTML = allInfo.projDet.sow;
            document.querySelector("#dealer_po_number").value = allInfo.projDet.po;
        } catch (error) {
            console.log(error);
        }
    }
}

async function pasteData(type) {
    let inetInfo;
    try {
        const clipboardContents = await navigator.clipboard.read();
        for (const item of clipboardContents) {
            for (const mimeType of item.types) {
                if (mimeType === "text/plain") {
                    const blob = await item.getType("text/plain");
                    const blobText = await blob.text();
                    inetInfo = blobText;
                    pasteInfo(inetInfo, type);
                } else {
                    throw new Error(`${mimeType} not supported.`);
                }
            }
        }
    } catch (error) {
    }
}

// Project Details Button
const projButton = document.createElement("button");
projButton.innerHTML = "Paste Details";
projButton.addEventListener("click", (event) => {
    event.stopImmediatePropagation();
    event.preventDefault();
    pasteData("projDet")
})

const projDetDiv = document.querySelector("#contentColumn > form > table:nth-child(3)");
projDetDiv.before(projButton);

// Info Button
const infoButton = document.createElement("button");
infoButton.innerHTML = "Paste Info";
infoButton.addEventListener("click", (event) => {
    event.stopImmediatePropagation();
    event.preventDefault();
    pasteData("compInfo")
    pasteData("conInfo")
    pasteData("sitInfo")
});

// Add to Company Info tab
const compInfoTab = document.querySelector("#company");
const compInfoFrame = document.querySelector("#company > table");
compInfoTab.insertBefore(infoButton, compInfoFrame);

// Add to Company Info tab
const conInfoTab = document.querySelector("#contact")
const conInfoFrame = document.querySelector("#contact > table")
const conButton = infoButton.cloneNode(true);
conInfoTab.insertBefore(conButton, conInfoFrame);

// Add to Site Conditions tab
const sitInfoTab = document.querySelector("#siteconditions")
const sitInfoFrame = document.querySelector("#siteconditions > table")
const sitButton = infoButton.cloneNode(true);
sitInfoTab.insertBefore(sitButton, sitInfoFrame);
