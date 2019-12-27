function toggleSupplierIdInput() {
    // Get the checkbox
    const checkBox = document.getElementById("inputSupplier");
    // Get the output text
    const inputBox = document.getElementById("supplierId");

    // If the checkbox is checked, display the output text
    if (checkBox.checked == true){
        inputBox.style.display = "block";
    } else {
        inputBox.style.display = "none";
    }
}