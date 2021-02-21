'use strict'


let model = (function () {
	
return {
	countries : [],
	validCountries : [],
	weekReport : [],
}
})();


let view = (function () {
	const placeHolders = {
		numberTotal : document.getElementById('numberTotal'),
		newNumber : document.getElementById('newNumber'),
		totalImmunized : document.getElementById('totalImmunized')
	}
	return {
		//Exibi os dados no dashboard
		showDashboardValues : (data) => {
			const dom = placeHolders;
			dom.numberTotal.textContent = data.totalVaccinations;
			dom.newNumber.textContent  =  data.newVaccinations;
			dom.totalImmunized.textContent =  data.fullyVaccinated;
		},

		//Gera uma lista com os países válidos
		generateList : (countrieKey, countrieName) => {
			let sectionDOM = document.querySelector('.country-selector').innerHTML += `<option value="${countrieKey}"> ${countrieName} </option>`;
		},
		cleanTable : () => {
			let table = document.getElementById('week-report');
			while (table.rows.length > 0) {
				table.deleteRow(1);
			}


		},
		generateTable : (dataArray, tableData) => {
			let table = tableData;
			for (let i = 0; i < 7; i++) {
				let newRow = table.insertRow(1 + i);

					let newText = document.createTextNode(`${dataArray[i].date}`);
					let newCell = newRow.insertCell(0);
					newCell.appendChild(newText);

					newText = document.createTextNode(`${dataArray[i].totalVaccinations}`);
					newCell = newRow.insertCell(-1);
					newCell.appendChild(newText);

					newText = document.createTextNode(`${dataArray[i].newVaccinations}`);
					newCell = newRow.insertCell(-1);
					newCell.appendChild(newText);

					newText = document.createTextNode(`${dataArray[i].fullyVaccinated}`);
					newCell = newRow.insertCell(-1);
					newCell.appendChild(newText);

					
			}
		}

	};
})();



let controller = ( function (appModel,appView) {
	document.querySelector('.country-selector').addEventListener("change",  (e) => {
		let data = checkDailyReport(e.target.value);
		appView.showDashboardValues(data);
		checkWeek(e.target.value);
		appView.generateTable(appModel.weekReport);
		
	});

	function convertData (value) {
		if (!value) {
			return ("-");
		}else {
			return value.toLocaleString();
		}
	} 

	function checkWeek (countryKey) {
		for (let i = 7; i > 0; i--) {
			let objeto = {
				date : convertData(appModel.countries[countryKey].data[appModel.countries[countryKey].data.length - i]?.date),
				totalVaccinations : convertData(appModel.countries[countryKey].data[appModel.countries[countryKey].data.length - i]?.total_vaccinations),
				newVaccinations : convertData(appModel.countries[countryKey].data[appModel.countries[countryKey].data.length - i]?.new_vaccinations),
				fullyVaccinated : convertData(appModel.countries[countryKey].data[appModel.countries[countryKey].data.length - i]?.people_fully_vaccinated)
			}
			appModel.weekReport.push(objeto);
		}

	}
	function checkDailyReport (countryKey) {
		if (appModel.countries[countryKey].data[appModel.countries[countryKey].data.length - 1].total_vaccinations) {
			return {
				totalVaccinations : convertData(appModel.countries[countryKey].data[appModel.countries[countryKey].data.length - 1].total_vaccinations),
				newVaccinations : convertData(appModel.countries[countryKey].data[appModel.countries[countryKey].data.length - 1].new_vaccinations),
				fullyVaccinated : convertData(appModel.countries[countryKey].data[appModel.countries[countryKey].data.length - 1].people_fully_vaccinated)
			}
		}else if (appModel.countries[countryKey].data[appModel.countries[countryKey].data.length - 2].total_vaccinations) {
			return {
				totalVaccinations :  convertData(appModel.countries[countryKey].data[appModel.countries[countryKey].data.length - 2].total_vaccinations),
				newVaccinations : convertData(appModel.countries[countryKey].data[appModel.countries[countryKey].data.length - 2].new_vaccinations),
				fullyVaccinated : convertData(appModel.countries[countryKey].data[appModel.countries[countryKey].data.length - 2].people_fully_vaccinated)
			}
		}else if (appModel.countries[countryKey].data[appModel.countries[countryKey].data.length - 3].total_vaccinations) {
			return {
				totalVaccinations :  convertData(appModel.countries[countryKey].data[appModel.countries[countryKey].data.length - 3].total_vaccinations),
				newVaccinations : convertData(appModel.countries[countryKey].data[appModel.countries[countryKey].data.length - 3].new_vaccinations),
				fullyVaccinated : convertData(appModel.countries[countryKey].data[appModel.countries[countryKey].data.length - 3].people_fully_vaccinated)
			}
		}
	}

	//Faz a requisição do arquivo json
	async function requestData () {
		const requestURL = "https://covid.ourworldindata.org/data/owid-covid-data.json";
		let response = await fetch(requestURL);
		let countryInfos = await response.json();
		appModel.countries = countryInfos;
	}

	//Verifica os países que iniciaram o programa de vacinação (covid-19)
	async function checkValidCountries(){
		await requestData();
		let countriesKeys = [];

		//Pega os keys dos países do objeto countries
		Object.keys(appModel.countries).forEach((e) => {
			countriesKeys.push(e);
		})

		for (let i = 0; i < countriesKeys.length; i++) {
			let isValid = 0;

			/* Verifica em três diferentes dias o registro de total de vacinação; 
			esta verificação é a validação de que o país iniciou o programa de vacinação contra a covid-19 */
			if (appModel.countries[ countriesKeys[i] ].data[ appModel.countries [countriesKeys[i]].data.length - 1 ].total_vaccinations) {
				isValid++;
			}else if (appModel.countries[ countriesKeys[i] ].data[ appModel.countries [countriesKeys[i]].data.length - 2 ].total_vaccinations) {
				isValid++;
			}else if (appModel.countries[ countriesKeys[i] ].data[ appModel.countries [countriesKeys[i]].data.length - 3 ].total_vaccinations) {
				isValid++;
			}
			if (isValid > 0) {
				appModel.validCountries.push( countriesKeys[i] );
			}
		}

		appModel.validCountries.forEach((e) => {
			let country = appModel.countries[e].location;
			appView.generateList(e,country);
		})

	}

	requestData();
	checkValidCountries();
	return {

	}
})(model,view);
