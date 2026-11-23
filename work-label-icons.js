/* Work-label icons, ONE shared home (Nov 23, 2026, Scott: add the 4 to the shared set).
   Bold solid, 24 px grid, drawn with currentColor. Todays Tasks (index.html), the hours strip
   (work-label-strip.js) and the Style Guide all read from here. Values saved in the database:
   new, design, insights, debug. */
window.PY_WL={order:['new','design','insights','debug'],
names:{new:'New functionality',design:'Finessing design',insights:'Crafting insights',debug:'Debugging'},
strip:{new:'#3f6f8f',design:'#c0577f',insights:'#e8a23a',debug:'#5f9e6a',none:'#d5dae1'},
ink:{on:'#7a3a52',off:'#a5788a'},
icons:{"new": "<path fill-rule=\"evenodd\" d=\"M5.5 3h13A2.5 2.5 0 0 1 21 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-13A2.5 2.5 0 0 1 5.5 3zM11 7v4H7v2h4v4h2v-4h4v-2h-4V7z\"/>", "design": "<path fill-rule=\"evenodd\" d=\"M12 2l6.5 7.5L16 18H8L5.5 9.5zM12 9a1.6 1.6 0 1 0 0 3.2A1.6 1.6 0 0 0 12 9zm-.8-4.5v4h1.6v-4z\"/><rect x=\"8\" y=\"19.2\" width=\"8\" height=\"2.8\" rx=\"1\"/>", "insights": "<path d=\"M12 2a7 7 0 0 0-4.2 12.6V17h8.4v-2.4A7 7 0 0 0 12 2z\"/><rect x=\"8.8\" y=\"18.2\" width=\"6.4\" height=\"1.8\" rx=\".9\"/><rect x=\"10\" y=\"20.8\" width=\"4\" height=\"1.6\" rx=\".8\"/>", "debug": "<ellipse cx=\"12\" cy=\"14.5\" rx=\"5\" ry=\"6\"/><circle cx=\"12\" cy=\"6.8\" r=\"3\"/><path d=\"M3.5 9.5l3.5 2M3 15h4M4.5 21l3-2.5M20.5 9.5L17 11.5M21 15h-4M19.5 21l-3-2.5\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" fill=\"none\"/>"}};
