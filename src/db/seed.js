import { dbHelpers } from './database.js'

export function seedDatabase() {
  try {
    // Verificar se já existem dados
    const cities = dbHelpers.getAllCities()
    if (cities.length > 0) {
      console.log('Banco de dados já possui dados. Pulando seed.')
      return
    }

    console.log('Iniciando seed do banco de dados...')

    // Criar cidade
    const city = dbHelpers.createCity('São Paulo')
    console.log('Cidade criada:', city.name)

    // Criar bairros
    const neighborhood1 = dbHelpers.createNeighborhood(city.id, 'Centro', '001')
    const neighborhood2 = dbHelpers.createNeighborhood(city.id, 'Vila Mariana', '002')
    const neighborhood3 = dbHelpers.createNeighborhood(city.id, 'Pinheiros', '003')
    console.log('Bairros criados')

    // Criar RGs para cada bairro
    const rg1 = dbHelpers.createRG(neighborhood1.id, '001-01', 'Quarteirão Centro - Rua das Flores')
    const rg2 = dbHelpers.createRG(neighborhood1.id, '001-02', 'Quarteirão Centro - Av. Principal')
    const rg3 = dbHelpers.createRG(neighborhood2.id, '002-01', 'Quarteirão Vila Mariana - Rua Augusta')
    const rg4 = dbHelpers.createRG(neighborhood2.id, '002-02', 'Quarteirão Vila Mariana - Rua da Consolação')
    const rg5 = dbHelpers.createRG(neighborhood3.id, '003-01', 'Quarteirão Pinheiros - Rua dos Pinheiros')
    console.log('RGs criados')

    // Criar imóveis para RG1 (25 imóveis - dentro do mínimo)
    const streets1 = [
      'Rua das Flores', 'Rua das Rosas', 'Rua das Violetas', 'Rua das Margaridas', 'Rua das Orquídeas'
    ]
    
    for (let i = 0; i < 25; i++) {
      const street = streets1[i % streets1.length]
      const number = (i + 1).toString()
      const types = ['R', 'R', 'R', 'C', 'R', 'R', 'TB', 'R', 'R', 'PE']
      const type = types[i % types.length]
      
      dbHelpers.createProperty(
        rg1.id,
        street,
        number,
        type,
        type === 'R' ? Math.floor(Math.random() * 5) + 1 : 0,
        type === 'R' ? Math.floor(Math.random() * 3) : 0,
        type === 'R' ? Math.floor(Math.random() * 2) : 0,
        i
      )
    }
    console.log('Imóveis RG1 criados: 25')

    // Criar imóveis para RG2 (30 imóveis)
    for (let i = 0; i < 30; i++) {
      const street = 'Av. Principal'
      const number = (i + 100).toString()
      const types = ['R', 'C', 'R', 'R', 'TB', 'R', 'OUT', 'R', 'PE', 'R']
      const type = types[i % types.length]
      
      dbHelpers.createProperty(
        rg2.id,
        street,
        number,
        type,
        type === 'R' ? Math.floor(Math.random() * 6) + 1 : 0,
        type === 'R' ? Math.floor(Math.random() * 3) : 0,
        type === 'R' ? Math.floor(Math.random() * 2) : 0,
        i
      )
    }
    console.log('Imóveis RG2 criados: 30')

    // Criar imóveis para RG3 (28 imóveis)
    for (let i = 0; i < 28; i++) {
      const street = 'Rua Augusta'
      const number = (i + 200).toString()
      const types = ['R', 'R', 'C', 'R', 'R', 'TB', 'R', 'PE', 'R', 'R']
      const type = types[i % types.length]
      
      dbHelpers.createProperty(
        rg3.id,
        street,
        number,
        type,
        type === 'R' ? Math.floor(Math.random() * 5) + 1 : 0,
        type === 'R' ? Math.floor(Math.random() * 2) : 0,
        type === 'R' ? Math.floor(Math.random() * 2) : 0,
        i
      )
    }
    console.log('Imóveis RG3 criados: 28')

    // Criar imóveis para RG4 (35 imóveis - próximo do máximo)
    for (let i = 0; i < 35; i++) {
      const street = 'Rua da Consolação'
      const number = (i + 300).toString()
      const types = ['R', 'C', 'R', 'R', 'R', 'TB', 'OUT', 'R', 'R', 'PE']
      const type = types[i % types.length]
      
      dbHelpers.createProperty(
        rg4.id,
        street,
        number,
        type,
        type === 'R' ? Math.floor(Math.random() * 7) + 1 : 0,
        type === 'R' ? Math.floor(Math.random() * 3) : 0,
        type === 'R' ? Math.floor(Math.random() * 2) : 0,
        i
      )
    }
    console.log('Imóveis RG4 criados: 35')

    // Criar imóveis para RG5 (37 imóveis - máximo)
    for (let i = 0; i < 37; i++) {
      const street = 'Rua dos Pinheiros'
      const number = (i + 400).toString()
      const types = ['R', 'R', 'C', 'R', 'TB', 'R', 'R', 'PE', 'OUT', 'R']
      const type = types[i % types.length]
      
      dbHelpers.createProperty(
        rg5.id,
        street,
        number,
        type,
        type === 'R' ? Math.floor(Math.random() * 6) + 1 : 0,
        type === 'R' ? Math.floor(Math.random() * 3) : 0,
        type === 'R' ? Math.floor(Math.random() * 2) : 0,
        i
      )
    }
    console.log('Imóveis RG5 criados: 37')

    // Criar agentes
    const agent1 = dbHelpers.createAgent('João Silva', 'ACE001', '(11) 99999-1111', 'joao.silva@saude.gov.br')
    const agent2 = dbHelpers.createAgent('Maria Santos', 'ACE002', '(11) 99999-2222', 'maria.santos@saude.gov.br')
    const agent3 = dbHelpers.createAgent('Pedro Oliveira', 'ACE003', '(11) 99999-3333', 'pedro.oliveira@saude.gov.br')
    console.log('Agentes criados')

    // Criar visitas de exemplo para o agente 1 (data de hoje)
    const today = new Date().toISOString().split('T')[0]
    const properties1 = dbHelpers.getPropertiesByRG(rg1.id)
    
    // Simular visitas em alguns imóveis
    const visitedCount = Math.min(15, properties1.length)
    for (let i = 0; i < visitedCount; i++) {
      const property = properties1[i]
      const statuses = ['visited', 'visited', 'visited', 'closed', 'absent', 'refused']
      const status = statuses[i % statuses.length]
      
      const eliminatedFoci = status === 'visited' ? Math.floor(Math.random() * 3) : 0
      const treatedFoci = status === 'visited' ? Math.floor(Math.random() * 2) : 0
      const larvicideGrams = treatedFoci > 0 ? (Math.random() * 50 + 10).toFixed(1) : 0
      
      dbHelpers.createVisit(
        property.id,
        agent1.id,
        today,
        status,
        eliminatedFoci,
        treatedFoci,
        parseFloat(larvicideGrams),
        status === 'visited',
        status === 'visited' ? 'Orientações sobre prevenção fornecidas' : null
      )
    }
    console.log(`Visitas criadas: ${visitedCount}`)

    // Atualizar resumo diário
    dbHelpers.createDailySummary(agent1.id, today)
    dbHelpers.updateDailySummaryStats(agent1.id, today)
    console.log('Resumo diário atualizado')

    console.log('\n✅ Seed completado com sucesso!')
    console.log('\nResumo:')
    console.log('- 1 cidade')
    console.log('- 3 bairros')
    console.log('- 5 RGs')
    console.log('- 155 imóveis')
    console.log('- 3 agentes')
    console.log('- Visitas simuladas para hoje')

  } catch (error) {
    console.error('Erro ao fazer seed do banco de dados:', error)
    throw error
  }
}
