function Suggestions(){

const suggestions=[

"Learn React",

"Learn SQL",

"Improve Project Descriptions",

"Add Internship",

"Deploy Projects"

];

return(

<div className="bg-white rounded-2xl shadow p-6">

<h2 className="font-bold text-xl mb-5">

AI Suggestions

</h2>

<ul className="space-y-3">

{

suggestions.map(item=>(

<li key={item}>

✅ {item}

</li>

))

}

</ul>

</div>

);

}

export default Suggestions;