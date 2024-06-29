const WEB_HOOK = "https://discord.com/api/webhooks/1256409742784335953/ze0Ljk7l7WwI0umdTwV0nlfZXTsVY9WKgDulh8FFaTilbsxaKLVPRIo6PA7lMb2mzu1h"; // Lien vers le WebHook du canal (https://imgur.com/a/n1CTbgV)

const USERNAME = "Formulaires"; // Nom de l'expéditeur du post
const AVATAR_URL = "https://cdn.discordapp.com/attachments/1239933353218670765/1256394475920691211/Screen_Shot_2016-07-31_at_6.55.03_PM.webp?ex=66809c09&is=667f4a89&hm=48c55f99408d79882b07021b5d1c5e0cec939400e2ae8373b81bdee000660c3d&"; // Lien vers l'avatar

// {TIME} dans le texte sera remplacé par l'heure actuelle. Exemple : https://imgur.com/a/OW1X9XS
const CONTENT = "Formulaire envoyé {TIME}"; // Texte du message
const COLOR = 6284949; // Couleur de la ligne à gauche - Couleurs ici : https://www.spycolor.com
const TITLE = "Demande d'organisation d'animation"; // Titre de l'Embed (peut être laissé vide)
const DESK = "Un membre souhaite organiser une animation sur le serveur France Memes"; // Description de l'Embed (peut être laissée vide)
const FOOTER = "Système de formulaire par MaelysNath"; // Texte en bas de l'Embed (peut être laissé vide)
const TIMESTAMP = true; // Heure du post en bas. true - activé / false - désactivé

// PARAMÈTRES SUPPLÉMENTAIRES
// GÉNÉRAL :
NUMBER_QUESTION = false; // Ajouter le numéro de la question au début de la question. true - activé / false - désactivé

// Pour CHECKBOX et CHECKBOX_GRID :
CHECKBOX_STROKE = false; // Mettre une bordure `text` autour des réponses. true - activé / false - désactivé
CHECKBOX_SEPARATION = "\n "; // Symbole pour la séparation entre les réponses. \n signifie nouvelle ligne

// Pour GRID (Tableau de choix multiples) :
GRID_STROKE = true; // Mettre une bordure `text` autour des réponses et des questions. true - activé / false - désactivé
GRID_SEPARATION = "\n "; // Symbole pour la séparation entre les réponses. \n signifie nouvelle ligne

// Pour MULTIPLE_CHOICE :
MULTIPLE_CHOICE_STROKE = true; // Mettre une bordure `text` autour des réponses et des questions. true - activé / false - désactivé
MULTIPLE_CHOICE_SEPARATION = "\n "; // Symbole pour la séparation entre les réponses. \n signifie nouvelle ligne


// ================================================================================================================ //


// NE RIEN CHANGER CI-DESSOUS !
function onSubmit(e) {
    const response = e.response.getItemResponses();
    let items = [];
    var num = 1;

    for (const responseAnswer of response) {
        const question = responseAnswer.getItem().getTitle();
        let answer = responseAnswer.getResponse();

        // Traitement des différents types de questions
        switch (responseAnswer.getItem().getType()) {
            case FormApp.ItemType.FILE_UPLOAD:
                if (Array.isArray(answer)) {
                    const fileUrls = answer.map(id => getDriveFileUrlById(id)).join('\n');
                    answer = fileUrls;
                } else {
                    answer = getDriveFileUrlById(answer);
                }
                break;
            case FormApp.ItemType.CHECKBOX:
            case FormApp.ItemType.CHECKBOX_GRID:
                if (Array.isArray(answer)) { 
                    if (CHECKBOX_STROKE) {
                        answer = answer.map(choice => `\`${choice}\``).join(CHECKBOX_SEPARATION);
                    } else {
                        answer = answer.join(CHECKBOX_SEPARATION);
                    }
                }
                break;
            case FormApp.ItemType.GRID:
                const gridItem = responseAnswer.getItem().asGridItem();
                const rows = gridItem.getRows();
                const columns = gridItem.getColumns();

                if (Array.isArray(answer)) {
                    if (GRID_STROKE) {
                        answer = answer.map((selectedChoice, index) => `\`${rows[index]}: ${selectedChoice}\``).join(GRID_SEPARATION);
                    } else {
                        answer = answer.map((selectedChoice, index) => `${rows[index]}: ${selectedChoice}`).join(GRID_SEPARATION);
                    }
                }
                break;
            case FormApp.ItemType.MULTIPLE_CHOICE:
                if (Array.isArray(answer)) {
                    if (MULTIPLE_CHOICE_STROKE) {
                        answer = answer.map(choice => `\`${choice}\``).join(MULTIPLE_CHOICE_SEPARATION);
                    } else {
                        answer = answer.join(MULTIPLE_CHOICE_SEPARATION);
                    }
                }
                break;
        }

        if (!answer) {
            continue;
        }

        if (NUMBER_QUESTION) {
            items.push({
                "name": `${num}. ${question}`,
                "value": answer,
                "inline": false
            });
        } else {
            items.push({
                "name": question,
                "value": answer,
                "inline": false
            });
        }
        num += 1
    }

    var TIMES = "";
    if (TIMESTAMP) {
        TIMES = new Date().toISOString();
    }

    function replaceTime(inputString) {
        var TIME = `<t:${Math.floor(new Date().getTime() / 1000)}:R>`;
        return inputString.replace(/\{TIME\}/g, TIME);
    }

    var options = {
        "method": "post",
        "headers": {
            "Content-Type": "application/json",
        },
        "payload": JSON.stringify({
            "content": replaceTime(CONTENT),
            "embeds": [{
                "title": replaceTime(TITLE),
                "description": replaceTime(DESK),
                "color": COLOR,
                "fields": items,
                "footer": {
                    "text": replaceTime(FOOTER)
                },
                "timestamp": TIMES
            }],
            username: USERNAME,
            avatar_url: AVATAR_URL,
        })
    };

    UrlFetchApp.fetch(WEB_HOOK, options);
}

function getDriveFileUrlById(id) {
    var file = DriveApp.getFileById(id);
    return file.getUrl();
}
