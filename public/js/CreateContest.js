var createCount = 0;

function getFormItem(){

    var v1 = document.forms["cForm"]["inputName"].value;
    var v2 = document.forms["cForm"]["inputDate"].value;

    EmptyCheck1(v1,v2);
}

function EmptyCheck1(chk1,chk2){

    if (chk1 === "")
    {
        // if contest name is null
        alert("Please input the league name");
        // $('.alert-box').removeClass("hide");
        // $('body').addClass("alert-box-open");
        // $('.alert-box p').append("Please input the league name");
        return false;
    }
    else if(chk2 === "")
    {
        // if contest date is null
        alert("Please input the Date");
        // $('.alert-box').removeClass("hide");
        // $('body').addClass("alert-box-open");
        // $('.alert-box p').append("Please input the Date");
        return false;
    }
    else if(checkPastDate(chk2) === false)
    {
        // if contest date is in past
        alert("It's invalid date. Please input the valid date.");
        // $('.alert-box').removeClass("hide");
        // $('body').addClass("alert-box-open");
        // $('.alert-box p').append("It's invalid date. Please input the valid date");
        return false;
    }
    else
    {
        // create over 5 times
        if(createCount >= 5){
            alert("You already have 5 contests. Out of limit.");
            // $('.alert-box').removeClass("hide");
            // $('body').addClass("alert-box-open");
            // $('.alert-box p').append("You already have 5 contests. Out of limit");
            return false;
        }

        createCount++;
        // create contest successful
        
        alert("Create contest successful.");
        // $('.alert-box').removeClass("hide");
        // $('body').addClass("alert-box-open");
        // $('.alert-box p').append("Create contest successful");
        return true;
    }
}

function closeAlert() {
    $('.alert-box').addClass("hide");
    $('body').removeClass("alert-box-open");
    $('.alert-box p').empty();
}

// check the contest date is in the past or not
function checkPastDate(inputDate) {
    var d = new Date();

    d = new Date(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate());
    var d2 = new Date(inputDate);
    if (d2 == "Invalid Date") {
        alert("It's invalid date.");
        // $('.alert-box').removeClass("hide");
        // $('body').addClass("alert-box-open");
        // $('.alert-box p').append("It's invalid date");
        return false;
    }

    var n = d.getTime() - d2.getTime();
    if (n === 0) {
        return true;
    } else if (n > 0) {
        return false;
    } else {
        return true;
    }
}

module.exports = {
    getFormItem,
    EmptyCheck1
};