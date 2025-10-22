// ==UserScript==
// @name        INET Input Buttons
// @namespace   jhutt.com
// @license     MIT
// @match       https://*.facilitynet.com/members/customers/installQuote/*
// @downloadURL https://raw.githubusercontent.com/Numuruzero/INETButtons/refs/heads/main/INETInput.user.js
// @require     https://cdn.jsdelivr.net/npm/@violentmonkey/dom@2
// @version     0.6
// @description A set of buttons to automatically input order info
// ==/UserScript==

const url = window.location.href;

////////////////////////////////////////////////// Universal functions //////////////////////////////////////////////////
function pasteInfo(data, type) {
    let allInfo
    console.log(`Data type is ${type}`);
    try {
        allInfo = JSON.parse(data);
    } catch (error) {
        console.log(error);
    }
    // Company Info input
    if (type == "compInfo") {
        document.querySelector("input[name='company_name']").value = allInfo.compInfo.company;
        document.querySelector("input[name='company_phone_raw']").value = allInfo.compInfo.phone;
        document.querySelector("#saddress1").value = allInfo.compInfo.street;
        document.querySelector("#saddress2").value = allInfo.compInfo.suite;
        document.querySelector("#scity").value = allInfo.compInfo.city;
        document.querySelector("#sstate").value = allInfo.compInfo.state;
        document.querySelector("#szip").value = allInfo.compInfo.zip;
    }
    // Contact Info input
    if (type == "conInfo") {
        document.querySelector("input[name='contact_first']").value = allInfo.conInfo.fname;
        document.querySelector("input[name='contact_last']").value = allInfo.conInfo.lname;
        document.querySelector("input[name='business_phone_raw']").value = allInfo.conInfo.phone;
        document.querySelector("input[name='email']").value = allInfo.conInfo.email;
    }
    // Site Conditions input
    if (type == "sitInfo") {
        document.querySelector("#certOfInsurancePropertyMgmt").checked = allInfo.sitInfo.coi;
        document.querySelector("#noLoadingDock").checked = allInfo.sitInfo.dock;
        document.querySelector("#elevator").checked = allInfo.sitInfo.elevator;
        if (allInfo.sitInfo.stairs != 0) { document.querySelector("input[name='num_of_steps']").value = allInfo.sitInfo.stairs };
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
            document.querySelector("#detail_17").checked = allInfo.projDet.afterhrsdel;
            document.querySelector("#detail_1").checked = allInfo.projDet.afterhrsins;
            document.querySelector("#detail_2").checked = allInfo.projDet.exclusive;
            document.querySelector("#job_description_ifr").contentDocument.querySelector("body").innerHTML = allInfo.projDet.sow;
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
    // const node = document.querySelector('body > div[aria-labelledby="ui-id-9"]');    // We only need to look at attributes
    const node = document.querySelector("body > div[aria-describedby='divSelect']");
    const config = { attributes: true, characterData: true };

    const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
            // Check if "Add New User" dialog is available
            if (node) {
                const ar = Array.from(document.querySelectorAll("span[class='ui-dialog-title']"));
                const endUserHeader = ar.find(span => span.textContent === "Add New End User");
                if (node.style.display != 'none' && endUserHeader.innerHTML == 'Add New End User') {
                    // Info Button
                    const infoButton = document.createElement("button");
                    infoButton.innerHTML = "Paste Info";
                    infoButton.className = "pastebutton";
                    infoButton.addEventListener("click", (event) => {
                        event.stopImmediatePropagation();
                        event.preventDefault();
                        pasteData("compInfo")
                        pasteData("conInfo")
                        pasteData("sitInfo")
                    });

                    if (document.getElementsByClassName("pastebutton").length < 3) {
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
    // We're looking for the popup that is created when we go to add an end user
    // const node = document.querySelector("body > div:nth-child(16)");
    const node = document.querySelector("body > div[aria-describedby='divSelect']");
    // const node = document.querySelector("#divSelect");
    // const node = document.querySelector("#company");

    if (node && !url.includes("jobDetails")) {
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
    const node = document.querySelector("#job_description_ifr");

    if (node && url.includes("jobDetails")) {
        console.log("Project Details loaded")
        addProjectDetails();

        // disconnect observer
        return true;
    }
});
