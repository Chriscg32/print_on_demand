

func (p *program) Start(s service.Service) error {
	log.Println("Service starting...")
	go p.run()
	return nil
}

func (p *program) run() {
	log.Println("Service started")
	for {
		time.Sleep(5 * time.Second)
		log.Println("Service heartbeat")
	}
}

func (p *program) Stop(s service.Service) error {
	log.Println("Service stopped")
	return nil
}

func main() {
	// Set up logging to a file
	logFile, err := os.OpenFile("C:\\print_on_demand\\logs\\service.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Println("Failed to open log file:", err)
		os.Exit(1)
	}
	log.SetOutput(logFile)
	defer logFile.Close()

	log.Println("Service initialization started")

	svcConfig := &service.Config{
		Name:        "POD-CryptoService",
		DisplayName: "Print on Demand Cryptographic Service",
		Description: "Handles cryptographic operations for POD system",
	}

	prg := &program{}
	s, err := service.New(prg, svcConfig)
	if err != nil {
		log.Println("Service creation failed:", err)
		os.Exit(1)
	}

	if len(os.Args) > 1 {
		err = service.Control(s, os.Args[1])
		if err != nil {
			log.Printf("Failed %s: %v\n", os.Args[1], err)
			os.Exit(1)
		}
		return
	}

	err = s.Run()
	if err != nil {
		log.Println("Service run failed:", err)
	}
}