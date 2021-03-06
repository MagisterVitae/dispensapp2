import React, { useEffect, useState, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AddItem from './AddItem';
import RemoveItem from './RemoveItem';
import BarcodeScanner from '../barcode/barcodeScanner';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Grid from '@material-ui/core/Grid';
import axios from 'axios';
import * as config from '../../config';
import CreateTemplate from '../catalog/CreateTemplate';

const useStyles = makeStyles({
  itemButton: {
    // marginBottom: '5vh',
  },
  container: {
    height: '80vh',
    marginTop: '15vh'
  }
});

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function Home(props) {
  const catalogBaseUrl = config.catalogBaseUrl(process.env.REACT_APP_API_URL);
  const storageBaseUrl = config.storageBaseUrl(process.env.REACT_APP_API_URL);
  axios.defaults.headers.common = { 'Authorization': `Bearer ${props.auth.token}` }

  const classes = useStyles();

  const barcode = useRef(null);
  const movement = useRef(null);
  const [good, setGood] = useState({});
  const [isScanning, setIsScanning] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    switch (message.type) {
      case 's':
        setShowSuccessMessage(true);
        break;
      case 'e':
        setShowErrorMessage(true);
        break;
      default:
        break;
    }
  }, [message]);

  function movementSelector(mov) {
    movement.current = mov;
    setIsScanning(true);
    //handleScan('987654145')
  }

  function handleScan(bc) {
    setIsScanning(false);
    barcode.current = bc;
    if (movement.current === 'add') {
      addItem(barcode.current);
    }
    if (movement.current === 'remove') {
      removeItem(barcode.current);
    }
  }

  function addItem(barcode) {
    axios.get(catalogBaseUrl.concat(barcode)).then( //cerca good dato barcode
      (response) => {
        //item esiste, incrementa good quantity
        const curGood = response.data;
        axios.put(storageBaseUrl.concat(response.data._id), {
          "delta": response.data.items[0].itemsPerPackage
        }).then(
          (response) => {
            console.log(response.data);
            setMessage({ type: 's', text: `${curGood.category.charAt(0).toUpperCase() + curGood.category.slice(1)} aggiunto` })
          }
        ).catch(
          (err) => {
            console.error(err);
          }
        )
      }
    ).catch(
      (err) => {
        console.log(err);
        //good non esiste, crea good con qty = item.itemsPerPackage + item
        setGood({
          "category": "",
          "quantity": 0,
          "items": [
            {
              "itemsPerPackage": 1,
              "barcode": barcode.current,
            }
          ]
        });
        setIsCreating(true);
      }
    )
  }

  function removeItem(barcode) {
    axios.get(catalogBaseUrl.concat(barcode)).then(
      (response) => {
        const curGood = response.data;
        if (response.data.quantity < response.data.items[0].itemsPerPackage) {
          setMessage({ type: 'e', text: 'Operazione annullata per giacenza negativa' })
        }
        const deltaValue = -1 * response.data.items[0].itemsPerPackage;
        axios.put(storageBaseUrl.concat(response.data._id), {
          "delta": deltaValue
        }).then(
          () => {
            setMessage({ type: 's', text: `${curGood.category.charAt(0).toUpperCase() + curGood.category.slice(1)} rimosso` })
          }
        ).catch((err) => { console.error(err) });
      }
    ).catch(
      (err) => {
        console.error(err)
        setMessage({ type: 'e', text: 'Articolo non trovato' })
      }
    )
  }

  function handleSaveNewItem() {
    setIsCreating(false);
    axios.get(storageBaseUrl.concat(escape(good.category))).then(
      (response) => {
        if (response.data === null) {
          //Good non esiste, crea good
          axios.post(storageBaseUrl, {
            "category": good.category,
            "quantity": good.items[0].itemsPerPackage,
          }).then(
            () => {
              //Agguingi item
              axios.post(catalogBaseUrl.concat(escape(good.category)), {
                "itemsPerPackage": good.items[0].itemsPerPackage,
                "barcode": good.items[0].barcode || barcode.current
              }).then(
                () => {
                  setMessage({ type: 's', text: `${good.category.charAt(0).toUpperCase() + good.category.slice(1)} creato` })
                }
              ).catch((err) => { console.error(err) });
            }
          ).catch((err) => { console.error(err) });
        } else {
          //Good esiste, aggiungi item
          const storedGood = response.data;
          axios.post(catalogBaseUrl.concat(escape(storedGood.category)), {
            "itemsPerPackage": good.items[0].itemsPerPackage,
            "barcode": good.items[0].barcode || barcode.current
          }).then(
            () => {
              //Incrementa quantità good
              axios.put(storageBaseUrl.concat(storedGood._id), {
                "delta": good.items[0].itemsPerPackage
              }).then(
                () => {
                  setMessage({ type: 's', text: `${good.category.charAt(0).toUpperCase() + good.category.slice(1)} aggiunto` })
                }
              ).catch((err) => { console.log(err) });
            }
          ).catch((err) => { console.error(err) });
        }
      }
    ).catch((err) => { console.error(err) });
  }

  function handleNewItemChange(changedProp) {
    if (changedProp.barcode !== undefined) {
      let newGood = JSON.parse(JSON.stringify(good));
      let newItems = [...newGood.items];
      newGood.items[0] = { ...newItems[0], barcode: changedProp.barcode };
      setGood(newGood);
      barcode.current = changedProp.barcode;
    } else if (changedProp.itemsPerPackage !== undefined) {
      let newGood = JSON.parse(JSON.stringify(good));
      let newItems = [...newGood.items];
      newGood.items[0] = { ...newItems[0], itemsPerPackage: changedProp.itemsPerPackage };
      setGood(newGood);
    } else {
      setGood((good => {
        // Object.assign would also work
        return { ...good, ...changedProp };
      }));
    }
  }

  function handleAbortNewItem() {
    setIsCreating(false);
  }

  return (
    <div>
      <div hidden={isScanning || isCreating}>
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
          className={classes.container}
        >
          <Grid item xs={9}>
            <AddItem onClick={() => { movementSelector('add') }} />
          </Grid>
          <Grid item xs={9}>
            <RemoveItem onClick={() => { movementSelector('remove') }} />
          </Grid>
        </Grid>
      </div>
      <div hidden={!isScanning}>
        <BarcodeScanner onScan={handleScan} enableScanner={isScanning} />
      </div>
      <div hidden={!isCreating}>
        <CreateTemplate barcode={barcode.current} good={good} auth={props.auth} onSave={handleSaveNewItem} onCancel={handleAbortNewItem} onChange={handleNewItemChange} />
      </div>
      <div>
        <Snackbar open={showSuccessMessage} autoHideDuration={2000} onClose={() => { setShowSuccessMessage(false) }}>
          <Alert onClose={() => { setShowSuccessMessage(false) }} severity="success">
            {message.text}
          </Alert>
        </Snackbar>
        <Snackbar open={showErrorMessage} autoHideDuration={2000} onClose={() => { setShowErrorMessage(false) }}>
          <Alert onClose={() => { setShowErrorMessage(false) }} severity="error">
            {message.text}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}

export default Home;