$(function() {
  var sendButton = $("#contactForm button#send");
  var sendSpinner = $("#contactForm #sendSpinner");
  var formHelpSection = $("#contactForm .form-help-section");
  var subjectRadio1 = $("#contactForm input#subjectRadio1");
  var subjectRadio2 = $("#contactForm input#subjectRadio2");
  var arrivalDate = $("#contactForm input#arrival");
  var departureDate = $("#contactForm input#departure");
  var purposeCheck1 = $("#contactForm input#purposeCheck1");
  var purposeCheck2 = $("#contactForm input#purposeCheck2");
  var ageCheck = $("#contactForm input#ageCheck");
  var alertS = $("#alertSuccess");
  var alertF = $("#alertFail");

  subjectRadio1.change(function(){
    if (this.value === "on") {
      formHelpSection.each(function () {
        $(this).slideUp("fast", function () {
          arrivalDate.removeAttr('required');
          departureDate.removeAttr('required');
          ageCheck.removeAttr('required');
        });
      });
    }
  });
  subjectRadio2.change(function(){
    if (this.value === "on") {
      formHelpSection.each(function () {
        $(this).slideDown("fast", function () {
          arrivalDate.attr('required', true);
          departureDate.attr('required', true);
          ageCheck.attr('required', true);
        });
      });
    }
  });

  $("#contactForm").on("submit", function(event){
    event.preventDefault();
    sendSpinner.removeClass("d-none");
    sendButton.attr("disabled", true);
    alertS.first().slideUp("fast");
    alertF.first().slideUp("fast");

    var subjectMail;
    var subjectText;
    var additionalMessage;
    if (!formHelpSection.is(":visible")) {
      subjectMail = "contact@tarmac-festival.de";
      subjectText = "Allgemeine Anfrage";
      additionalMessage = "";
    } else {
      subjectMail = "helpinghands@tarmac-festival.de";
      subjectText = "Ich möchte helfen";
      additionalMessage = "<br>Anreisedatum: "
          + arrivalDate.val()
          + "<br>Abreisedatum: "
          + departureDate.val()
          + "<br>Helfen beim Aufbau: "
          + purposeCheck1.is(":checked")
          + "<br>Helfen beim Abbau: "
          + purposeCheck2.is(":checked")
          + "<br>Ich bin über 18: "
          + ageCheck.is(":checked");
    }

    var name = $("#contactForm input#name").val();
    var email = $("#contactForm input#email").val();
    var message = "Nachricht von: "
        + name
        + " ["
        + email
        + "]<br>Betreff: "
        + subjectText
        + additionalMessage
        + "<br><br>"
        + $("textarea#message").val();

    var result = grecaptcha.execute('6LcuY9QUAAAAACswQfBwCN5I8Q0x6fmFXEKGhV5d', {action:'validate_captcha'})
      .then(function (token) {
        console.log('recaptcha token: ' + token);

        var request = $.ajax({
          type: "POST",
          url: "/checkRecaptcha",
          data: {
            "token": token,
            "subject": subjectText,
            "name": name,
            "userMail": email,
            "userName": name,
            "email": subjectMail,
            "message": message
          }
        });

        request.done(function (response, textStatus){
          console.log('response: ' + response, textStatus);
          sendSpinner.addClass("d-none");
          sendButton.attr("disabled", false);
          if(response.result === 'success') {
            alertS.first().slideDown("fast").delay(5000).slideUp("fast");
            $("#contactForm").get(0).reset();
            formHelpSection.each(function () {
              $(this).slideUp("fast", function () {
                arrivalDate.removeAttr('required');
                departureDate.removeAttr('required');
                ageCheck.removeAttr('required');
              });
            });
          } else {
            alertF.first().slideDown("fast");
          }
        });

        request.fail(function (jqXHR, textStatus, errorThrown){
          // Log the error to the console
          console.error("Error while sending mail: " + textStatus, errorThrown);
          alertF.first().slideDown("fast");
          sendSpinner.addClass("d-none");
          sendButton.attr("disabled", false);
        });
      });
    return false;
  });

  $("a[data-toggle=\"tab\"]").click(function(e) {
    e.preventDefault();
    $(this).tab("show");
  });
});