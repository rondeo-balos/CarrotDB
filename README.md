# CarrotDB

<img src="./assets/carrotdb_512.png" width="70px" height="70px" style="display:inline;"/>
<p><b>CarrotDB</b> is a json-based database management system that you want with the querying and indexing that you need. It an open source dbms, and because of that it has the capabalities to operate offline which will boost your productivity to the next level.</p>



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
