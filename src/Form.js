import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

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
            <td>Loading...</td>
            <td>Loading...</td>
            <td>Loading...</td>
            <td>Loading...</td>
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
        {data.map((item) => (
          <tr key={item.MAC}>
            <td>{item.SLOT}</td>
            <td>{item.PON}</td>
            <td>{item.MAC}</td>
            <td>
              <button
                className="btn btn-primary"
                onClick={() => handleProvisioning(item.MAC, item.SLOT, item.PON, item.TIPO_ONU, hosts[selectedTab])}
              >
                Provisionar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
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
    setSelectedTab(index);
    console.log(index)
    const host = document.querySelectorAll('.react-tabs__tab')[index].getAttribute('host');
    fetchData(host);
  };

  const handleProvisioning = async (mac, slot, pon, tipo_onu, host) => {
    try{
        const payload = {
            "ip_olt": host,
            "slot_pon": `${slot}-${pon}`,
            "mac_onu": mac,
            "nome_cliente": "MUDAR DEPOIS",
            "tipo_onu": tipo_onu,
            "vlan": "1500"
        }

        const {data} = await axios.post(`${API_ENDPOINT}/autorizaOnu`, payload);

        if(data[0].msg != "Sucesso"){
            window.alert("Ocorreu um erro ao provisionar, atualize e tente novamente")
        }else{
            document.querySelectorAll('.react-tabs__tab')[selectedTab].click()
        }
    }catch(e){

    }

    console.log('Provisioning for ID:', mac, host);
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
