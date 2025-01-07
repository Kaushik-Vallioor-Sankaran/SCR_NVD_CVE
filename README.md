# SCR_NVD_CVE - Understanding of how the appln. works

* Data is stored externally in JSON format which can be accessed through a given link.
* This data has to be exported to my MongoDB database.
* Since the volume of data ranges upto 260,000, it is smart and efficient to access them in batch format - a chunk of data is read at a time.
* This data imported in a batch format has to be displayed to the user in such a way that they will be able to access all the records while being able to view either 10 or 50 or 100 records at a time.
* In the record displayed in the first page - cves/list - the cve_id, the source identifier, the published date, the last modified date and the vulnerability status of each software vulnerability is displayed.
* When clicked on a row, we are directed to - cves/cve_id - where the description and various other details of the s/w vulnerability is displayed.
* In the first page - cves/list - links are created to each of the API endpoints that are used to filter data based on the parameters given, the links will direct us to separate pages for each API endpoint which is   again directed to the description page of the s/w vulnerabilitied when a row is selected.
* ![WhatsApp Image 2025-01-08 at 05 14 05_307a34f2](https://github.com/user-attachments/assets/23ea5127-eff8-40c1-b4a8-44fc18e2a7d3)
