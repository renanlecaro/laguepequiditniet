const fs = require('fs')
const {markdown}= require('markdown')
const pug = require('pug');

const offers=fs.readdirSync('offers')
    .filter(filename=>filename!='exemple.md')
    .map(filename=>({filename,text:fs.readFileSync('offers/'+filename).toString()}))
  .map(({filename,text})=>{
    const lines=text.split('\n')
    const title=lines[0].slice(1).trim()
    const url = lines[1].trim()
    if(!title) throw "Pas de titre à la ligne 0 de "+filename
    if(!url.match(/^http/)) throw "Pas d'url à la ligne 1 de "+filename

    const fieldsTitleLine=lines.find(l=>l.trim()=='## Fiche produit')
    const freeTextLine=lines.find(l=>l.trim()=='## Description')

    if(!fieldsTitleLine) throw filename+' : pas de fiche produit '
    if(!freeTextLine) throw filename+' : pas de description '
    const fieldLines = lines.slice(lines.indexOf(fieldsTitleLine), lines.indexOf(freeTextLine) ).slice(1)
    const freeTextLines=lines.slice(lines.indexOf(freeTextLine) ).slice(1)
    const fields={}

    fieldLines.map(l=>l.split(':'))
      .filter(parts=>parts.length==2)
      .forEach(([key, value])=>{
        fields[key.trim().toLowerCase().replace(/ +/gi,'_')]=value.trim()
      })
    return{url, title,
      freeText:markdown.toHTML(freeTextLines.join('\n')), fields}
  })

const columns = offers.map(offer=>Object.keys(offer.fields))
  .reduce((a,b)=>a.concat(b),[])
  .filter((e,i,a)=>a.indexOf(e)===i)
  .map(field=>({field, label:field.replace(/_/gi,' ')}))

console.log({columns, offers})
const index=pug.renderFile('index.pug', {
  self:true,
  columns, offers, test:[1,2,3]
})

fs.writeFileSync('offers/exemple.md', `
# [nom du logiciel]
[https://adresse-du-logiciel.fr]
 
## Fiche produit
${columns.map(c=>c.label+' : [valeur]').join('\n\n')}


## Description

[description de votre service en markdown]

`)

fs.writeFileSync('./index.html', index)
console.log(index)