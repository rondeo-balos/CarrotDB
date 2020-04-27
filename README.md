# CarrotDB
Nodejs Database Backend/Serverside

<strong>Usages (JS)</strong>
<p>Retrieving data from the database</p>
<pre>
carrotdb.database().collection("stores/products/").value(function(e){
  //e returns a json array of data
});
</pre>

<p>Pushing data to the database</p>
<pre>
carrotdb.database().collection("stores/products/").push(function(e){
  //e returns a a key of pushed data
  //e.key
});
</pre>

<p>Setting the datasets to the database from a reference</p>
<pre>
carrotdb.database().collection("stores/products/"+key).set({json data});
</pre>

<p>Clearing a dataset from the database</p>
<pre>
carrotdb.database().collection("stores/products/"+key).clear(function(e){
  //e returns the last data
});
</pre>

<strong>Donate!</strong><br>
You can pay me for a candy<br>
https://paypal.me/rondeox23
