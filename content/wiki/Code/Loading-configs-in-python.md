---
title: Loading configs in Python
---

## Motivation 
- The loading nested configurations can be difficult. 
- Pythons yaml loader does not deal with it nicely. 
- loading as dict -> key access, dot access would be nicer. 
- many dependencies otherwise (Hydra, OmegaConf, ...)


Simple solution for loading.
- No external dependencies.
- Allows dot access. 
- Allows the use of `safe_load`.
	- `yaml.load` poses security risks -> Loads arbitrary code. 


Possible extensions: 
- Add Pydantic for convenient validation of configs.
- Add typing.

```python
import yaml 
import json
from types import SimpleNamespace

def load_object(dct):
    return SimpleNamespace(**dct)

def load_config(path):
    """
    Loads the configuration yaml and parses it into an object with dot access.
    """
    with open(path, encoding="utf-8") as stream:
        # Load dict
        config_dict = yaml.safe_load(stream)

        # Convert to namespace (access via config.data etc)
        config = json.loads(json.dumps(config_dict), object_hook=load_object)
    return config, config_dict
```


For typing one can use the following construction: 

```python
from dataclasses import dataclass

@dataclass
class MyModelConfig: 
	module: models.mymodel
	hidden_size: int 



class MyModel: 
	def __init__(self, config: MyModelConfig):
		# Model def goes here.
		# Typing allows autocomplete.
		pass 
	
	...

```


# References in yaml

- Yaml allows for references
- Avoids duplicates. 
- Great when configs need to be passed to multiple modules 
	- Data and model for instance. 

```yaml 
  experimentconfig: &id-exp
  name: MyCoolExperiment

model: 
  module: models.mymodel
  hidden_size: 10 
  expconfig: *id-exp

data: 
  module: data.mydata
  root: ./data 
  expconfig: *id-exp
```



Saving configs 
- tbd


