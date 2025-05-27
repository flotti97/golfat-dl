// ==UserScript==
// @name         Golf.at Tabellen Drucken Button
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Fügt einen Button zum Drucken der Brutto/Netto Tabellen hinzu
// @match        https://www.golf.at/golfclubs/turniersuche/golfclub-maria-theresia-haag-h-/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function addButton() {
        if (!document.body) {
            setTimeout(addButton, 100);
            return;
        }
        if (document.getElementById('print-brutto-btn') || document.getElementById('print-netto-btn')) return;

        // Brutto Button
        const bruttoBtn = document.createElement('button');
        bruttoBtn.id = 'print-brutto-btn';
        bruttoBtn.innerText = 'Bruttowertung drucken';
        Object.assign(bruttoBtn.style, {
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            padding: '12px 18px',
            backgroundColor: '#093852',
            color: 'white',
            fontSize: '16px',
            zIndex: '9999',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
        });

        // Netto Button
        const nettoBtn = document.createElement('button');
        nettoBtn.id = 'print-netto-btn';
        nettoBtn.innerText = 'Nettowertung drucken';
        Object.assign(nettoBtn.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '12px 18px',
            backgroundColor: '#093852',
            color: 'white',
            fontSize: '16px',
            zIndex: '9999',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
        });

        // Helper to activate tab
        function activateTab(tabId) {
            const tabLink = document.querySelector(`a[href*="#${tabId}"]`);
            if (tabLink) tabLink.click();
        }

        function removeClassAttributes(element) {
            if (!element) return;
            if (element.removeAttribute) element.removeAttribute('class');
            if (element.children) {
                for (let child of element.children) {
                    removeClassAttributes(child);
                }
            }
        }

        // Remove all HTML tags inside <td> and keep only the text
        function flattenTableCells(table) {
            if (!table) return;
            const tds = table.querySelectorAll('td');
            tds.forEach(td => {
                td.innerHTML = td.textContent.replace(/\u00a0/g, ' '); // Replace &nbsp; with space
            });
        }

        // Print Brutto
        bruttoBtn.onclick = function () {
            bruttoBtn.disabled = true;
            bruttoBtn.innerText = 'Bitte warten...';
            const bruttoDiv = document.getElementById('Bruttowertung');
            let bruttoTable = bruttoDiv ? bruttoDiv.querySelector('table') : null;
            if (!bruttoTable) activateTab('Bruttowertung');
            setTimeout(() => {
                const updatedBruttoTable = bruttoDiv ? bruttoDiv.querySelector('table') : null;
                let tableHtml = '';
                if (updatedBruttoTable) {
                    const clone = updatedBruttoTable.cloneNode(true);
                    removeClassAttributes(clone);
                    flattenTableCells(clone); // Flatten cells before printing
                    tableHtml = clone.outerHTML;
                } else {
                    tableHtml = '<p>Keine Bruttowertung gefunden.</p>';
                }
                let html = `
        <div style="break-inside: avoid; page-break-inside: avoid;">
            <h2>Bruttowertung</h2>
            ${tableHtml}
        </div>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; }
            h2 { margin-top: 30px; page-break-after: avoid; }
            table { width: 100%; border-collapse: collapse; font-size: 12pt; page-break-before: avoid; }
            th, td { border: 1px solid #333; padding: 4px 8px; }
            th { background: #eee; }
            @media print {
                body { margin: 0; }
                table { page-break-inside: avoid; page-break-before: avoid; }
                div { break-inside: avoid; page-break-inside: avoid; }
                h2 { page-break-after: avoid; }
                table { page-break-before: avoid; }
                thead { display: table-header-group; }
            }
        </style>`;
                const win = window.open('', '', 'width=900,height=1200');
                win.document.write('<html><head><title>Bruttowertung</title></head><body>' + html + '</body></html>');
                win.document.close();
                win.focus();
                win.onload = function () {
                    win.print();
                    win.close();
                    bruttoBtn.disabled = false;
                    bruttoBtn.innerText = 'Bruttowertung drucken';
                };
            }, 600);
        };

        // Print Netto
        nettoBtn.onclick = function () {
            nettoBtn.disabled = true;
            nettoBtn.innerText = 'Bitte warten...';
            const nettoDiv = document.getElementById('Nettowertung');
            let nettoTable = nettoDiv ? nettoDiv.querySelector('table') : null;
            if (!nettoTable) activateTab('Nettowertung');
            setTimeout(() => {
                const updatedNettoTable = nettoDiv ? nettoDiv.querySelector('table') : null;
                let tableHtml = '';
                if (updatedNettoTable) {
                    const clone = updatedNettoTable.cloneNode(true);
                    removeClassAttributes(clone);
                    flattenTableCells(clone); // Flatten cells before printing
                    tableHtml = clone.outerHTML;
                } else {
                    tableHtml = '<p>Keine Nettowertung gefunden.</p>';
                }
                let html = `
        <div style="break-inside: avoid; page-break-inside: avoid;">
            <h2>Nettowertung</h2>
            ${tableHtml}
        </div>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; }
            h2 { margin-top: 30px; page-break-after: avoid; }
            table { width: 100%; border-collapse: collapse; font-size: 12pt; page-break-before: avoid; }
            th, td { border: 1px solid #333; padding: 4px 8px; }
            th { background: #eee; }
            @media print {
                body { margin: 0; }
                table { page-break-inside: avoid; page-break-before: avoid; }
                div { break-inside: avoid; page-break-inside: avoid; }
                h2 { page-break-after: avoid; }
                table { page-break-before: avoid; }
                thead { display: table-header-group; }
            }
        </style>`;
                const win = window.open('', '', 'width=900,height=1200');
                win.document.write('<html><head><title>Nettowertung</title></head><body>' + html + '</body></html>');
                win.document.close();
                win.focus();
                win.onload = function () {
                    win.print();
                    win.close();
                    nettoBtn.disabled = false;
                    nettoBtn.innerText = 'Nettowertung drucken';
                };
            }, 600);
        };

        document.body.appendChild(bruttoBtn);
        document.body.appendChild(nettoBtn);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addButton);
    } else {
        addButton();
    }
})();

