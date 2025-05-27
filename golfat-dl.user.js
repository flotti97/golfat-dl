// ==UserScript==
// @name         Golf.at Turnierergenisse drucken
// @author       Florian
// @namespace    http://tampermonkey.net/
// @version      1.8
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

        // Helper to extract tournament info (event name, date, type)
        function getTournamentInfo() {
            const tabContent = document.getElementById('myTabContent');
            let name = '';
            let date = '';
            let type = '';
            if (tabContent) {
                // <p> two above, <h2> three above
                let p = tabContent;
                let h2 = tabContent;
                for (let i = 0; i < 2; i++) {
                    if (p && p.previousElementSibling) p = p.previousElementSibling;
                }
                for (let i = 0; i < 3; i++) {
                    if (h2 && h2.previousElementSibling) h2 = h2.previousElementSibling;
                }
                if (h2 && h2.tagName === 'H2') {
                    name = h2.textContent.trim();
                }
                if (p && p.tagName === 'P') {
                    // Example: "01.05.2025 - Einzel (Stableford)"
                    const text = p.textContent;
                    // Date: dd.mm.yyyy
                    const dateMatch = text.match(/(\d{2}\.\d{2}\.\d{4})/);
                    if (dateMatch) date = dateMatch[1];
                    // Tournament type: after dash, before <br>
                    const typeMatch = text.match(/\d{2}\.\d{2}\.\d{4}\s*-\s*([^\(<\n\r]+)/);
                    if (typeMatch) type = typeMatch[1].trim();
                    // If type is still empty, try to get from parentheses
                    if (!type) {
                        const parenMatch = text.match(/\(([^)]+)\)/);
                        if (parenMatch) type = parenMatch[1].trim();
                    }
                }
            }
            return { name, date, type };
        }

        // Helper to create a nice title section
        function createTitleSection(info, ratingType) {
            let html = `<div style="margin-bottom:18px;">
                <div style="font-size:20px;font-weight:bold;">${info.name || ''}</div>
                <div style="font-size:15px;">
                    ${info.date ? `<span style="margin-right:12px;">${info.date}</span>` : ''}
                    ${info.type ? `<span style="margin-right:12px;">${info.type}</span>` : ''}
                    <span style="margin-right:12px;font-weight:bold;">${ratingType}</span>
                </div>
            </div>`;
            return html;
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
                const info = getTournamentInfo();
                const titleSection = createTitleSection(info, 'Bruttowertung');
                let html = `
        <div style="break-inside: avoid; page-break-inside: avoid;">
            ${titleSection}
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
                win.document.write('<html><head><title>' + (info.name || 'Bruttowertung') + '</title></head><body>' + html + '</body></html>');
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
                const info = getTournamentInfo();
                const titleSection = createTitleSection(info, 'Nettowertung');
                let html = `
        <div style="break-inside: avoid; page-break-inside: avoid;">
            ${titleSection}
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
                win.document.write('<html><head><title>' + (info.name || 'Nettowertung') + '</title></head><body>' + html + '</body></html>');
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

