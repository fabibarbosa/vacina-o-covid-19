model = {
	requestURL: "https://covid.ourworldindata.org/data/owid-covid-data.json",
	countryInfos: {},
	placeHolders: {},
	validCountrysInfos : [],
	listDom : document.getElementById('selectOptions')
}

view = {
	render: function () {
		this.getPlaceholders();
		this.startCountryList();
		model.listDom.addEventListener("change", (e)=> {
			controller.getSelectedCountryInfos(e);
		})
	},

	//Seleciona os elementos do dom que irão mostrar os dados capturados
	getPlaceholders: () => {
		data = {
			appliedVaccines: document.getElementById('vaccination-number'),
			appliedVaccinesAddition: document.getElementById('vaccination-number-addition'),
			immunizedPeople: document.getElementById('immunized-number'),
			lastUpdate : document.getElementById('last-update')
		}
		return model.placeHolders = data;
	},

	//Efetuar a criação de uma lista de acordo com os países válidos
	startCountryList: () => {
		for (let i = 0; i < model.validCountrysInfos.length; i++) {
			model.listDom.innerHTML += `<option value="${model.validCountrysInfos[i]}">  ${model.countryInfos[model.validCountrysInfos[i]].location}</option>`;
		}
	}
}

controller = {

	//Realizar o fetch com os dados sobre  a vacina
	requestData: async () => {
		let response = await fetch(model.requestURL);
		model.countryInfos = await response.json();
		console.log(response)
	},
	init: async () => {
		await controller.requestData();
		controller.filterValidCountrys();
		view.render();
	},

	//Filtra os dados do json, selecionando somente os países que iniciaram a vacinação
	filterValidCountrys: () => {
		function checkValidCountry(country) {
			isValid = 0;
			for (let i = 0; i < 3; i++) {
				let specificCountry = model.countryInfos[country].data[model.countryInfos[country].data.length - i];
				if (specificCountry?.total_vaccinations) {
					isValid += 1;
				}
			}
			if (isValid > 0) {
				model.validCountrysInfos.push(country);
			}
		}

		Object.keys(model.countryInfos).forEach((element) => {
			checkValidCountry(element);
		})
	},

	//Pega as informações do país que foi escolhido no input select
	getSelectedCountryInfos : (e) => {
		function checkValues (value) {
			return typeof(value) == 'undefined' ? "Indisponível" : value.toLocaleString()
		}

		//Faz a captura de todas as informações necessárias
		function getFullInfo (country) {
			model.placeHolders.appliedVaccines.innerHTML = checkValues(country.total_vaccinations);
			model.placeHolders.appliedVaccinesAddition.innerHTML = `+${checkValues(country.new_vaccinations)}`;
			model.placeHolders.immunizedPeople.innerHTML = checkValues(country.people_fully_vaccinated);
			model.placeHolders.lastUpdate.innerHTML = checkValues(country.date);
		}

		//Verificar se o array tem informações referentes a vacinação.
		function filterData (country) {
			if (country == 0) {

			}
			else if (model.countryInfos[country].data[ model.countryInfos[country].data.length - 1].total_vaccinations) {
				let currentData = model.countryInfos[country].data[ model.countryInfos[country].data.length - 1];
				getFullInfo(currentData);
			}else if (model.countryInfos[country].data[ model.countryInfos[country].data.length - 2].total_vaccinations) {
				let currentData = model.countryInfos[country].data[ model.countryInfos[country].data.length - 2];
				getFullInfo(currentData);
			}else if (model.countryInfos[country].data[ model.countryInfos[country].data.length - 3].total_vaccinations) {
				let currentData = model.countryInfos[country].data[ model.countryInfos[country].data.length - 3];
				getFullInfo(currentData);
			}else { 
				console.log("Error");
			}
		}
		countrySelected = e.target.value;
		filterData(countrySelected);
		
	}
}


controller.init();