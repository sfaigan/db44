// Feel free to use this as a bookmarklet to autofill the checkout page

javascript:(
	function(){
		document.getElementById("billingAddressFirstName").value = "First";
		document.getElementById("billingAddressLastName").value = "Last";
		document.getElementById("billingAddressLine1").value = "1234 Fake Road";
		document.getElementById("billingAddressLine2").value = "";
		document.getElementById("billingAddressCountry").value = "Canada";
		document.getElementById("billingAddressProvince").value = "British Columbia";
		document.getElementById("billingAddressCity").value = "Victoria";
		document.getElementById("billingAddressPostalCode").value = "A1B1C3";
		document.getElementById("shippingAddressFirstName").value = "First";
		document.getElementById("shippingAddressLastName").value = "Last";
		document.getElementById("shippingAddressLine1").value = "1234 Fake Road";
		document.getElementById("shippingAddressLine2").value = "Canada";
		document.getElementById("shippingAddressCountry").value = "Canada";
		document.getElementById("shippingAddressProvince").value = "British Columbia";
		document.getElementById("shippingAddressCity").value = "Victoria";
		document.getElementById("shippingAddressPostalCode").value = "A1B1C3";
		document.getElementById("creditCardName").value = "First Last";
		document.getElementById("creditCardNumber").value = 1234;
		document.getElementById("creditCardExpiration").value = "12/20";
		document.getElementById("creditCardCVV").value = 123;
	}
)()