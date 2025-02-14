// ==UserScript==
// @name        INET Input Buttons
// @namespace   jhutt.com
// @license     MIT
// @match       https://www.facilitynet.com/members/customers/installQuote/*
// @downloadURL https://raw.githubusercontent.com/Numuruzero/INETButtons/refs/heads/main/INETInput.user.js
// @require     https://cdn.jsdelivr.net/npm/@violentmonkey/dom@2
// @version     0.1
// @description A set of buttons to automatically input order info
// ==/UserScript==

////////////////////////////////////////////////// Universal functions //////////////////////////////////////////////////
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

////////////////////////////////////////////////// Situational actions //////////////////////////////////////////////////
function addCustInfo() {
    // Create a MutationObserver to determine when the user navigates to creating a new end user
    // Node contains the floater text
    const node = document.querySelector("body > div:nth-child(15)");
    // We only need to look at attributes
    const config = { attributes: true, characterData: true };

    const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
            // Check if "Add New User" dialog is available
            if (document.querySelector("body > div:nth-child(15)")) {
                if (document.querySelector("body > div:nth-child(15)").style.display != 'none' && document.querySelector("#ui-id-9").innerHTML == 'Add New End User') {
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
                }
            }
        }
    }

    // Create observer
    const observer = new MutationObserver(callback);

    // Activate observer
    observer.observe(node, config);


}

function addProjectDetails() {
    // Check if Project Details page is active
    const projCheck = new RegExp('jobDetails');
    const url = window.location.href;
    const onProj = projCheck.test(url);

    if (onProj) {
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
    }
}

//Wait until document is sufficiently loaded for User Info
const infoLoad = VM.observe(document.body, () => {
    // Find the target node
    const node = document.querySelector("body > div:nth-child(16)");

    if (node) {
        console.log("User info loaded");
        addCustInfo();

        // disconnect observer
        return true;
    }
});

//Wait until document is sufficiently loaded for Project Description
const projLoad = VM.observe(document.body, () => {
    // Find the target node
    // const node = document.querySelector("#cke_1_contents > iframe").contentDocument.querySelector("body");
    const node = document.querySelector("#cke_1_contents > iframe");

    if (node) {
        console.log("Project Details loaded")
        addProjectDetails();

        // disconnect observer
        return true;
    }
});
