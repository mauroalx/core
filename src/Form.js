import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Swal from 'sweetalert2'

const DatatableSkeleton = () => {
  // Skeleton loading component
  return (
    <table className="table table-striped table-bordered">
      <thead className="thead-dark">
        <tr>
        <th>SLOT</th>
          <th>PON</th>
          <th>SERIAL</th>
          <th>AÇÃO</th>
        </tr>
      </thead>
      <tbody>
        {/* Create skeleton rows */}
        {[1].map((index) => (
          <tr key={index}>
            <td>Carregando lista...</td>
            <td>Carregando lista...</td>
            <td>Carregando lista...</td>
            <td>Carregando lista...</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const hosts = [
"172.25.37.11",
"172.25.36.3",
"172.25.37.2",
"172.20.254.2",
"172.16.253.2",
"172.16.254.2",
"168.196.55.98",
"172.17.13.2",
]

const Datatable = ({ data, handleProvisioning, selectedTab }) => {

//   console.log()

  const handleSendInput = async (e, host) => {
    const value = e.currentTarget.value

    const payload = {
      'ip_olt': host,
      'mac_onu': e.currentTarget.value
    };

    if(e.key == 'Enter'){
      const { data } = await axios.post(`${API_ENDPOINT}/localizaOnu`, payload);

      if(!data){
        Swal.fire({
          position: "top-end",
          icon: "warning",
          title: "ONU não localizada",
          showConfirmButton: false,
          timer: 1500
        });
      }else{
        const payload = {
          "ip_olt": host,
          "mac_onu": data.mac_onu,
          "slot_pon": data.slot_pon
        }

        document.querySelector('.desp').disabled = true;

        const response = await axios.post(`${API_ENDPOINT}/desautorizaOnu`, payload);

        document.querySelector('.desp').disabled = false;

        if(!response.data){
          await Swal.fire({
            position: "top-end",
            icon: "warning",
            title: "Ocorreu um erro ao desprovisionar, tente novamente",
            showConfirmButton: false,
            timer: 1500
          });
        }else{
          await Swal.fire({
            position: "top-end",
            icon: "success",
            title: "ONU deletada com sucesso",
            showConfirmButton: false,
            timer: 1500
          });

          document.querySelector('.desp').value = ""
        }

      }

      console.log(data)
    }


  }

  const [alias, setAlias] = useState('')

  return (
    <>
    <table className="table table-striped table-bordered">
      <thead className="thead-dark">
        <tr>
          <th>SLOT</th>
          <th>PON</th>
          <th>SERIAL</th>
          <th>AÇÃO</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.MAC}>
            <td>{item.SLOT}</td>
            <td>{item.PON}</td>
            <td>{item.MAC}</td>
            <td>
              <button
                className="btn btn-primary"
                onClick={() => handleProvisioning(item.MAC, item.SLOT, item.PON, item.TIPO_ONU, hosts[selectedTab], alias)}
              >
                Provisionar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <input type='search' className="alias" onKeyUp={(e) => setAlias(e.currentTarget.value)} placeholder='Insira o Alias da ONU que deseja provisionar'/>
    <input type='search' className="desp" onKeyUp={(e) => handleSendInput(e, hosts[selectedTab])} placeholder='Digite o SN da ONU que deseja desprovisionar'/>
    </>
  );
};

const API_ENDPOINT = 'http://172.23.21.66:8000';

const Form = () => {
  const [oltData, setOltData] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false); // State to track loading state
//   const [currentOlt, setCurrentOlt] = useState(''); // State to track loading state

  useEffect(() => {
    // setCurrentOlt('172.25.37.11')
    // fetchData('172.25.37.11'); // Fetch data for the default tab (OLT 1)
    // console.log(document.querySelectorAll('.react-tabs__tab')[0])
  }, []);

  const fetchData = async (host) => {
    try {
      setLoading(true); // Set loading state to true while fetching
      const payload = {
        ip_olt: host
      };
      const response = await axios.post(`${API_ENDPOINT}/buscaOnu`, payload);
      console.log(response.data)
      setOltData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false); // Set loading state to false after fetching
    }
  };

  const handleTabSelect = (index) => {
    if (loading){ //if a request is being done already, just force the user wait before
      Swal.fire({
        position: "top-end",
        icon: "warning",
        title: "Você já solicitou a listagem para uma OLT, aguarde a conclusão",
        showConfirmButton: false,
        timer: 1500
      });
    }else{
      setSelectedTab(index);
      console.log(index)
      const host = document.querySelectorAll('.react-tabs__tab')[index].getAttribute('host');
      fetchData(host);
    }
  };

  const handleProvisioning = async (mac, slot, pon, tipo_onu, host, alias) => {
    try{
        if(alias == ''){
          await Swal.fire({
            position: "top-end",
            icon: "warning",
            title: "Preencha o alias para finalizar o provisionamento",
            showConfirmButton: false,
            timer: 1500
          });


          let dom = document.querySelector('.alias')
          dom.focus()
          dom.style.border = '1px solid red'; // Add red border

          const initialPosition = parseFloat(window.getComputedStyle(dom).marginTop);
          let count = 0;
          const interval = setInterval(() => {
            dom.style.marginTop = (initialPosition + (count % 2 === 0 ? 10 : -10)) + 'px';
            count++;
            if (count === 6) {
              clearInterval(interval);
              dom.style.marginTop = initialPosition + 'px';
            }
          }, 50);

        }else{
            const payload = {
              "ip_olt": host,
              "slot_pon": `${slot}-${pon}`,
              "mac_onu": mac,
              "nome_cliente": alias,
              "tipo_onu": tipo_onu,
              "vlan": "1500"
          }

          const {data} = await axios.post(`${API_ENDPOINT}/autorizaOnu`, payload);

          if(data[0].msg != "Sucesso"){
              window.alert("Ocorreu um erro ao provisionar, atualize e tente novamente")
          }else{
              document.querySelectorAll('.react-tabs__tab')[selectedTab].click()
          }
        }
    }catch(e){

    }
  };

  return (
    <div className="page-container">
      <div className="box-container">
        <Tabs selectedIndex={selectedTab} onSelect={handleTabSelect}>
          <TabList>
            <Tab host="172.25.37.11">OLT PAF CENTRO</Tab>
            <Tab host="172.25.36.3">OLT PAF CENTRO 2</Tab>
            <Tab host="172.25.37.2">OLT PAF BTN</Tab>
            <Tab host="172.20.254.2">OLT BELEM</Tab>
            <Tab host="172.16.253.2">OLT PETROLANDIA 1</Tab>
            <Tab host="172.16.254.2">OLT PETROLANDIA 2</Tab>
            <Tab host="168.196.55.98">OLT SALGUEIRO</Tab>
            <Tab host="172.17.13.2">OLT BUIQUE</Tab>
          </TabList>
          {loading ? ( // Render skeleton loading component while loading
            <>
            <TabPanel>
              <DatatableSkeleton />
            </TabPanel>
            <TabPanel>
              <DatatableSkeleton />
            </TabPanel>
            <TabPanel>
              <DatatableSkeleton />
            </TabPanel>
            <TabPanel>
              <DatatableSkeleton />
            </TabPanel>
            <TabPanel>
              <DatatableSkeleton />
            </TabPanel>
            <TabPanel>
              <DatatableSkeleton />
            </TabPanel>
            <TabPanel>
              <DatatableSkeleton />
            </TabPanel>
            <TabPanel>
              <DatatableSkeleton />
            </TabPanel>
            </>
          ) : (
            <>
            <TabPanel>
              <Datatable data={oltData} selectedTab={selectedTab} handleProvisioning={handleProvisioning} />
            </TabPanel>
            <TabPanel>
              <Datatable data={oltData} selectedTab={selectedTab} handleProvisioning={handleProvisioning} />
            </TabPanel>
            <TabPanel>
              <Datatable data={oltData} selectedTab={selectedTab} handleProvisioning={handleProvisioning} />
            </TabPanel>
            <TabPanel>
              <Datatable data={oltData} selectedTab={selectedTab} handleProvisioning={handleProvisioning} />
            </TabPanel>
            <TabPanel>
              <Datatable data={oltData} selectedTab={selectedTab} handleProvisioning={handleProvisioning} />
            </TabPanel>
            <TabPanel>
              <Datatable data={oltData} selectedTab={selectedTab} handleProvisioning={handleProvisioning} />
            </TabPanel>
            <TabPanel>
              <Datatable data={oltData} selectedTab={selectedTab} handleProvisioning={handleProvisioning} />
            </TabPanel>
            <TabPanel>
              <Datatable data={oltData} selectedTab={selectedTab} handleProvisioning={handleProvisioning} />
            </TabPanel>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Form;
