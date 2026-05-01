document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  document.querySelector('#compose-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const composeRecipients = document.querySelector('#compose-recipients');
    const composeSubject = document.querySelector('#compose-subject');
    const composeBody = document.querySelector('#compose-body');

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: composeRecipients.value,
        subject: composeSubject.value,
        body: composeBody.value
      })
    })
    .then(response => response.json())
    .then(() => {
      load_mailbox('sent');
    });
    
  })
  
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-detailed-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detailed-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email => {
      //email.read email.archived
      let bgColour = undefined;
      
      if (email.read && mailbox !== "sent") {
        bgColour = "#dfdfdf";
      } else {
        bgColour = "white";
      }
      const element = document.createElement('div');
      const content =  `<div style = "background-color: ${bgColour};"  class="border border-dark p-2 mb-1 d-flex justify-content-between align-items-center">
                          <div>
                              <strong>${email.sender}</strong> <span class="ml-2">${email.subject}</span>
                          </div>
                          <div class="text-muted">
                              ${email.timestamp}
                          </div>
                        </div>`;

      element.innerHTML = content;
      document.querySelector('#emails-view').append(element);


      element.addEventListener('click',() => {
        let detailedView = document.querySelector('#email-detailed-view');
        detailedView.innerHTML = "";
        let content = document.createElement('div');
        
        const from = document.createElement('div');
        from.className = "mb-2";
        from.innerHTML = `<strong>From: </strong> ${email.sender}`;
        content.append(from);
        
        const to = document.createElement('div');
        to.className = "mb-2";
        to.innerHTML = `<strong>To: </strong> ${email.recipients}`;
        content.append(to);
        
        const subject = document.createElement('div');
        subject.className = "mb-2";
        subject.innerHTML = `<strong>Subject: </strong> ${email.subject}`;
        content.append(subject);
        
        const timestamp = document.createElement('div');
        timestamp.className = "mb-2";
        timestamp.innerHTML = `<strong>Timestamp: </strong> ${email.timestamp}`;
        content.append(timestamp);
        
        const replyButton = document.createElement('button');
        replyButton.className = "btn btn-sm btn-outline-primary ml-2 reply-button";
        replyButton.id = 'reply-button';
        replyButton.innerHTML = "Reply";
        content.append(replyButton);
        
        replyButton.addEventListener('click', () => {
          compose_email();
          
          document.querySelector('#compose-recipients').value = email.sender;
          
          let subject = email.subject;
          if (!subject.startsWith("Re: ")) {
            subject = `Re: ${subject}`;
          }
          document.querySelector('#compose-subject').value = subject;
          
          let body = `On ${email.timestamp} ${email.sender} wrote:\n ${email.body}`
          document.querySelector('#compose-body').value = body;
          
        })
        
        if (mailbox !== 'sent') {
          const archiveButton = document.createElement('button');
          
          archiveButton.className = "btn btn-sm btn-outline-secondary ml-2";
          archiveButton.innerHTML = email.archived ? "Unarchive" : "Archive";
          
          archiveButton.addEventListener('click', () => {
            fetch(`/emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                archived: !(email.archived)
              })
            })
            .then(() => {
              load_mailbox('inbox');
            })
          })
          
          content.append(archiveButton);
        }
        
        content.append(document.createElement('hr'));
        
        const body = document.createElement('div');
        body.innerHTML = email.body;
        content.append(body);
        
        detailedView.append(content);
        
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'none';
        document.querySelector('#email-detailed-view').style.display = 'block';
        
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })

      })
    })
  })
}




